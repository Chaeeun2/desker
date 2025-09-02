import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '../admin/lib/firebase';

// 설문 응답 저장
export const saveSurveyResponse = async (surveyData) => {
  try {
    // undefined 값을 빈 문자열로 변환
    const cleanedData = Object.keys(surveyData).reduce((acc, key) => {
      const value = surveyData[key];
      // undefined나 null이 아닌 경우만 포함
      if (value !== undefined && value !== null) {
        acc[key] = value;
      } else if (value === undefined) {
        // undefined인 경우 빈 문자열로 대체
        acc[key] = '';
      }
      return acc;
    }, {});

    const docRef = await addDoc(collection(db, 'surveys'), {
      ...cleanedData,
      submittedAt: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
    console.log('Survey saved with ID: ', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving survey: ', error);
    return { success: false, error: error.message };
  }
};

// 모든 설문 응답 가져오기
export const getAllSurveys = async () => {
  try {
    const q = query(collection(db, 'surveys'), orderBy('submittedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const surveys = [];
    querySnapshot.forEach((doc) => {
      surveys.push({ id: doc.id, ...doc.data() });
    });
    return surveys;
  } catch (error) {
    console.error('Error getting surveys: ', error);
    return [];
  }
};

// 설문 응답 삭제
export const deleteSurvey = async (surveyId) => {
  try {
    await deleteDoc(doc(db, 'surveys', surveyId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting survey: ', error);
    return { success: false, error: error.message };
  }
};

// 설문 통계 가져오기
export const getSurveyStats = async () => {
  try {
    const surveys = await getAllSurveys();
    
    const stats = {
      total: surveys.length,
      hasExperienced: {
        yes: surveys.filter(s => s.hasExperienced === 'yes').length,
        no: surveys.filter(s => s.hasExperienced === 'no').length
      },
      siteDiscovery: {},
      visitPurpose: {},
      dailySubmissions: {}
    };

    // 사이트 발견 경로 통계
    surveys.forEach(survey => {
      if (survey.siteDiscovery && Array.isArray(survey.siteDiscovery)) {
        survey.siteDiscovery.forEach(source => {
          stats.siteDiscovery[source] = (stats.siteDiscovery[source] || 0) + 1;
        });
      }
      
      // 방문 목적 통계
      if (survey.visitPurpose && Array.isArray(survey.visitPurpose)) {
        survey.visitPurpose.forEach(purpose => {
          stats.visitPurpose[purpose] = (stats.visitPurpose[purpose] || 0) + 1;
        });
      }
      
      // 일별 제출 통계
      if (survey.createdAt) {
        const date = survey.createdAt.split('T')[0];
        stats.dailySubmissions[date] = (stats.dailySubmissions[date] || 0) + 1;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting survey stats: ', error);
    return null;
  }
};