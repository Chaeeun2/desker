// Firebase에서 포트폴리오 컬렉션의 floors, gfa 필드 삭제 스크립트
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, deleteField } from 'firebase/firestore';

// Firebase 설정 (실제 설정으로 교체해야 함)
const firebaseConfig = {
  // 여기에 실제 Firebase 설정을 넣어주세요
  // firebase.js 파일의 설정과 동일해야 합니다
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupPortfolioFields() {
  try {
    // // console.log('포트폴리오 컬렉션에서 floors, gfa 필드 삭제를 시작합니다...');
    
    // 포트폴리오 컬렉션의 모든 문서 가져오기
    const portfolioCollection = collection(db, 'portfolio');
    const querySnapshot = await getDocs(portfolioCollection);
    
    let updatedCount = 0;
    let totalCount = querySnapshot.docs.length;
    
    // // console.log(`총 ${totalCount}개의 문서를 검사합니다...`);
    
    for (const docSnapshot of querySnapshot.docs) {
      const docId = docSnapshot.id;
      const docData = docSnapshot.data();
      
      // floors 또는 gfa 필드가 있는지 확인
      const hasFloors = docData.hasOwnProperty('floors');
      const hasGfa = docData.hasOwnProperty('gfa');
      
      if (hasFloors || hasGfa) {
        // // console.log(`문서 ${docId}에서 필드 삭제 중...`);
        
        const docRef = doc(db, 'portfolio', docId);
        const updateData = {};
        
        if (hasFloors) {
          updateData.floors = deleteField();
          // // console.log(`  - floors 필드 삭제`);
        }
        
        if (hasGfa) {
          updateData.gfa = deleteField();
          // // console.log(`  - gfa 필드 삭제`);
        }
        
        await updateDoc(docRef, updateData);
        updatedCount++;
        // // console.log(`  ✅ 문서 ${docId} 업데이트 완료`);
      } else {
        // // console.log(`문서 ${docId}: 삭제할 필드 없음`);
      }
    }
    
    // // console.log(`\n🎉 작업 완료!`);
    // // console.log(`- 총 문서 수: ${totalCount}`);
    // // console.log(`- 업데이트된 문서 수: ${updatedCount}`);
    // // console.log(`- 삭제된 필드: floors, gfa`);
    
  } catch (error) {
    // // console.error('❌ 오류 발생:', error);
  }
}

// 스크립트 실행
cleanupPortfolioFields();
