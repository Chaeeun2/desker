// Firebase 인증 서비스 (실무용 보안)
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  getIdToken
} from '@firebase/auth';
import { auth } from '../lib/firebase';

// 환경변수에서 허용된 관리자 이메일 가져오기
const ALLOWED_ADMIN_EMAILS = process.env.REACT_APP_ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];

/**
 * 관리자 로그인
 */
export const loginAdmin = async (email, password) => {
  try {
    // 1. Firebase Auth로 로그인
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 2. 환경변수와 이메일 일치 확인
    if (!ALLOWED_ADMIN_EMAILS.includes(user.email)) {
      await signOut(auth);
      throw new Error('허용되지 않은 관리자 이메일입니다.');
    }
    
    // 3. ID 토큰 새로고침 (커스텀 클레임 포함)
    await user.getIdToken(true);
    
    // 4. 커스텀 클레임 확인 (선택사항)
    try {
      const token = await getIdToken(user, true);
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      
      
      
      // 커스텀 클레임이 있으면 확인, 없으면 환경변수로만 확인
      if (decodedToken.admin === false) {
        await signOut(auth);
        throw new Error('관리자 권한이 없습니다.');
      }
    } catch (tokenError) {
      // console.log('⚠️ 커스텀 클레임 확인 실패, 환경변수로만 확인:', tokenError.message);
      // 커스텀 클레임이 없어도 환경변수에 있으면 로그인 허용
    }
    
    
    return { user, isAdmin: true };
    
  } catch (error) {
    // console.error('❌ 관리자 로그인 실패:', error);
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    } else if (error.message.includes('관리자 권한') || error.message.includes('허용되지 않은')) {
      throw error;
    } else {
      throw new Error('로그인 중 오류가 발생했습니다.');
    }
  }
};

/**
 * 로그아웃
 */
export const logoutAdmin = async () => {
  try {
    await signOut(auth);

  } catch (error) {
    // console.error('❌ 로그아웃 실패:', error);
    throw error;
  }
};

/**
 * 현재 사용자 상태 확인
 */
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      
      if (!user) {
        resolve(null);
        return;
      }
      
      try {
        // 환경변수로 관리자 확인
        const isAdmin = ALLOWED_ADMIN_EMAILS.includes(user.email);
        
        if (!isAdmin) {
          // 관리자가 아닌 경우 로그아웃
          await signOut(auth);
          resolve(null);
          return;
        }
        
        // 커스텀 클레임 확인 (선택사항)
        try {
          const token = await getIdToken(user, true);
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          
          if (decodedToken.admin === false) {
            await signOut(auth);
            resolve(null);
            return;
          }
        } catch (tokenError) {
  
        }
        
        resolve({ user, isAdmin: true });
      } catch (error) {
        // console.error('❌ 사용자 상태 확인 실패:', error);
        reject(error);
      }
    });
  });
};

/**
 * 관리자 권한 확인
 */
export const checkAdminPermission = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return false;
    
    // 환경변수로 관리자 확인
    const isAdmin = ALLOWED_ADMIN_EMAILS.includes(user.email);
    
    if (!isAdmin) return false;
    
    // 커스텀 클레임 확인 (선택사항)
    try {
      const token = await getIdToken(user, true);
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      
      return decodedToken.admin !== false; // false가 아니면 true
    } catch (tokenError) {
      return true; // 커스텀 클레임이 없어도 환경변수에 있으면 허용
    }
  } catch (error) {
    // console.error('❌ 관리자 권한 확인 실패:', error);
    return false;
  }
};

