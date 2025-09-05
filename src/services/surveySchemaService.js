import { collection, addDoc, getDocs, doc, getDoc, updateDoc, serverTimestamp, orderBy, query, where } from 'firebase/firestore';
import { db } from '../admin/lib/firebase';

// 현재 활성 설문지 스키마 가져오기
export const getActiveSurveySchema = async () => {
  try {
    // 단순화된 쿼리 - isActive만 필터링
    const q = query(
      collection(db, 'surveySchemas'), 
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // 활성 스키마가 없으면 기본 스키마 생성
      return await createDefaultSurveySchema();
    }
    
    // 여러 활성 스키마가 있으면 가장 최근 것 선택
    let latestSchema = null;
    let latestDate = null;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt);
      
      if (!latestDate || createdAt > latestDate) {
        latestDate = createdAt;
        latestSchema = { id: doc.id, ...data };
      }
    });
    
    return latestSchema;
  } catch (error) {
    return null;
  }
};
// 특정 버전의 스키마 가져오기
export const getSurveySchemaByVersion = async (version) => {
  try {
    const q = query(
      collection(db, 'surveySchemas'),
      where('version', '==', version)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    
    // 해당 버전이 없으면 null 반환
    return null;
  } catch (error) {
    return null;
  }
};

// 스키마 ID로 특정 스키마 가져오기 
export const getSurveySchemaById = async (schemaId) => {
  try {
    const docRef = doc(db, 'surveySchemas', schemaId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

// 모든 설문지 스키마 가져오기
export const getAllSurveySchemas = async () => {
  try {
    const q = query(collection(db, 'surveySchemas'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const schemas = [];
    querySnapshot.forEach((doc) => {
      schemas.push({ id: doc.id, ...doc.data() });
    });
    return schemas;
  } catch (error) {
    return [];
  }
};

// 새 설문지 스키마 생성
export const createSurveySchema = async (schemaData) => {
  try {
    // 기존 활성 스키마 비활성화 (오류가 나도 계속 진행)
    try {
      await deactivateAllSchemas();
    } catch (deactivateError) {
    }
    
    // 항상 새 스키마 생성 (새로운 문서 ID 자동 생성)
    const newSchemaData = {
      ...schemaData,
      isActive: true,
      createdAt: serverTimestamp(),
      version: generateVersion(),
      // ID는 제거 (Firestore가 자동 생성)
      id: undefined
    };
    
    // 기존 ID 제거
    delete newSchemaData.id;
    
    const docRef = await addDoc(collection(db, 'surveySchemas'), newSchemaData);
    
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 설문지 스키마 업데이트
export const updateSurveySchema = async (schemaId, updateData) => {
  try {
    await updateDoc(doc(db, 'surveySchemas', schemaId), {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 스키마 활성화/비활성화
export const toggleSchemaActive = async (schemaId) => {
  try {
    // 모든 스키마 비활성화
    await deactivateAllSchemas();
    
    // 선택한 스키마 활성화
    await updateDoc(doc(db, 'surveySchemas', schemaId), {
      isActive: true,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 모든 스키마 비활성화
const deactivateAllSchemas = async () => {
  try {
    const schemas = await getAllSurveySchemas();
    const updatePromises = schemas
      .filter(schema => schema.isActive) // 활성화된 스키마만 비활성화
      .map(async (schema) => {
        try {
          // 문서가 존재하는지 먼저 확인
          const docRef = doc(db, 'surveySchemas', schema.id);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            return updateDoc(docRef, { isActive: false });
          }
          return Promise.resolve();
        } catch (error) {
          return Promise.resolve(); // 오류가 나도 계속 진행
        }
      });
    await Promise.all(updatePromises);
  } catch (error) {
  }
};

// 버전 번호 생성
const generateVersion = () => {
  const now = new Date();
  return `v${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}.${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
};

// 기존 응답 데이터 마이그레이션 (버전 정보 추가)
export const migrateSurveyResponses = async () => {
  try {
    const { getAllSurveys } = await import('./surveyService');
    const surveys = await getAllSurveys();
    
    // 버전 정보가 없는 응답들 찾기
    const surveysWithoutVersion = surveys.filter(survey => !survey.schemaVersion);
    
    if (surveysWithoutVersion.length === 0) {
      return { success: true, message: '마이그레이션할 데이터가 없습니다.' };
    }
    
    // 기본 버전(v1.0)으로 업데이트
    const updatePromises = surveysWithoutVersion.map(survey => 
      updateDoc(doc(db, 'surveys', survey.id), {
        schemaVersion: 'v1.0',
        schemaId: null // 기존 데이터는 schemaId 없음
      })
    );
    
    await Promise.all(updatePromises);
    
    return { 
      success: true, 
      message: `${surveysWithoutVersion.length}개의 기존 응답에 버전 정보를 추가했습니다.` 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 기본 설문지 스키마 생성 (실제 SurveyModal 구조에 맞춤)
export const createDefaultSurveySchema = async () => {
  const defaultSchema = {
    title: `더 나은 워크라이프를 꿈꾸는
여러분의 이야기를 들려주세요.`,
    description: `데스커는 일하는 사람들의 새로운 가능을 응원하는 워크 앤 라이프스타일 브랜드입니다.
현재 일하는 환경에 대한 여러분의 생각을 남겨주시면, 앞으로의 활동에 참고하겠습니다.

설문에 참여해주신 분들께는
공식몰 쿠폰북과 워케이션 준비하기 툴킷 패키지(PDF)를 드리며,
추첨을 통해 데스커 라운지 홍대 1시간 이용권을 드립니다. (매월 추첨 10명)`,
    steps: [
      {
        id: "yangyang_experience",
        questions: [
          {
            id: "hasExperienced",
            type: "radio",
            title: "양양 워케이션을 경험해보셨나요?",
            required: true,
            options: [
              { value: "yes", label: "네" },
              { value: "no", label: "아니오" }
            ]
          },
          {
            id: "goodPoints",
            type: "textarea",
            title: "데스커 워케이션을 경험하면서 특별히 좋았던 점이 있다면 알려주세요.",
            placeholder: "좋았던 점을 자유롭게 작성해주세요.",
            required: false,
            condition: { field: "hasExperienced", value: "yes" }
          },
          {
            id: "photoUrl",
            type: "file",
            title: "데스커 워케이션을 추억할 수 있는 사진을 남겨주세요.",
            required: false,
            accept: "image/*",
            condition: { field: "hasExperienced", value: "yes" }
          }
        ]
      },
      {
        id: "site_discovery_purpose",
        questions: [
          {
            id: "siteDiscovery",
            type: "checkbox",
            title: "사이트를 어떤 경로로 알게 되셨나요?",
            subtitle: "(중복 선택 가능)",
            required: true,
            options: [
              { value: "desker_homepage", label: "데스커 홈페이지" },
              { value: "sns", label: "SNS" },
              { value: "search", label: "검색" },
              { value: "differ", label: "differ" },
              { value: "desker_lounge", label: "데스커 라운지" },
              { value: "other", label: "기타" }
            ]
          },
          {
            id: "siteDiscoverySearch",
            type: "text",
            title: "어떤 검색어로 찾아오셨나요?",
            required: false,
            condition: { field: "siteDiscovery", includes: "search" }
          },
          {
            id: "siteDiscoveryOther",
            type: "text", 
            title: "기타 경로를 알려주세요",
            required: false,
            condition: { field: "siteDiscovery", includes: "other" }
          },
          {
            id: "visitPurpose",
            type: "checkbox",
            title: "사이트 방문 목적이 어떻게 되시나요?",
            subtitle: "(중복 선택 가능)",
            required: true,
            options: [
              { value: "curious_activities", label: "데스커의 활동이 궁금해서" },
              { value: "workation_info", label: "워케이션 정보를 얻고 싶어서" },
              { value: "brand_collaboration", label: "브랜드 협업을 제안하고 싶어서" },
              { value: "work_culture", label: "업무 문화나 일하는 방식에 대해 알고 싶어서" },
              { value: "space_interior", label: "공간, 인테리어에 관심이 있어서" },
              { value: "other", label: "기타" }
            ]
          },
          {
            id: "visitPurposeOther",
            type: "text",
            title: "기타 목적을 알려주세요",
            required: false,
            condition: { field: "visitPurpose", includes: "other" }
          }
        ]
      },
      {
        id: "brand_collaboration",
        conditional: true,
        showCondition: { field: "visitPurpose", includes: "brand_collaboration" },
        questions: [
          {
            id: "companyName",
            type: "text",
            title: "회사명",
            required: true
          },
          {
            id: "contactPerson", 
            type: "text",
            title: "담당자명",
            required: true
          },
          {
            id: "brandPhoneNumber",
            type: "tel",
            title: "전화번호",
            required: true
          },
          {
            id: "email",
            type: "email",
            title: "이메일",
            required: true
          },
          {
            id: "collaborationTitle",
            type: "text",
            title: "제목",
            required: true
          },
          {
            id: "collaborationContent",
            type: "textarea",
            title: "협업 제안 내용",
            required: true
          }
        ]
      },
      {
        id: "work_info",
        questions: [
          {
            id: "workType",
            type: "text",
            title: "어떤 일을 하고 계시나요?",
            placeholder: "ex) 가구회사 브랜드 마케터",
            required: true
          },
          {
            id: "importantSpace",
            type: "radio",
            title: "오피스나 일하는 공간에서 가장 중요하게 보는 공간은 무엇인가요?",
            required: true,
            options: [
              { value: "personal_workspace", label: "개인 업무 공간" },
              { value: "meeting_space", label: "회의 공간" },
              { value: "lounge", label: "라운지 (휴식 공간)" },
              { value: "cafe", label: "카페" },
              { value: "other", label: "기타" }
            ]
          },
          {
            id: "importantSpaceOther",
            type: "text",
            title: "기타 공간을 알려주세요",
            required: false,
            condition: { field: "importantSpace", value: "other" }
          },
          {
            id: "discomfortPoints",
            type: "textarea",
            title: "업무 공간에서 가장 불편함을 느끼는 부분은 무엇인가요?",
            placeholder: "ex) 레이아웃, 가구, 실내 공기질 등",
            required: true
          }
        ]
      },
      {
        id: "work_environment",
        questions: [
          {
            id: "workEnvironment",
            type: "radio",
            title: "다음 중 가장 관심 있는 업무 환경은 어떤 모습인가요?",
            required: true,
            options: [
              { value: "work_rest_balance", label: "일과 쉼이 자연스럽게 조화되는 환경" },
              { value: "continuous_motivation", label: "꾸준히 동기부여가 되는 환경" },
              { value: "nature_worklife", label: "자연 속의 편안한 워크라이프" },
              { value: "flexible_challenge", label: "새로운 도전이 가능한 유연한 환경" },
              { value: "other", label: "기타" }
            ]
          },
          {
            id: "workEnvironmentOther",
            type: "text",
            title: "기타 업무 환경을 알려주세요",
            required: false,
            condition: { field: "workEnvironment", value: "other" }
          },
          {
            id: "expectedActivities",
            type: "checkbox",
            title: "데스커에 기대하는 활동이 있나요?",
            subtitle: "(중복 선택 가능)",
            required: true,
            options: [
              { value: "growth_content", label: "성장에 도움을 주는 컨텐츠 (ex. 인터뷰 아티클 등)" },
              { value: "sustainable_culture", label: "지속가능한 업무 문화를 만들기 위한 활동" },
              { value: "self_exploration", label: "나다움을 찾을 수 있는 자기 탐색 프로그램" },
              { value: "community_sharing", label: "관심사를 공유할 수 있는 커뮤니티 운영" },
              { value: "office_furniture", label: "몰입과 편안함을 고려한 사무가구" },
              { value: "business_support", label: "신규 비즈니스의 성장을 위한 지원" },
              { value: "other", label: "기타" }
            ]
          },
          {
            id: "expectedActivitiesOther",
            type: "text",
            title: "기타 기대 활동을 알려주세요",
            required: false,
            condition: { field: "expectedActivities", includes: "other" }
          }
        ]
      },
      {
        id: "personal_info",
        questions: [
          {
            id: "fullName",
            type: "text",
            title: "성함",
            required: true
          },
          {
            id: "phoneNumber",
            type: "tel",
            title: "연락처",
            placeholder: "010-0000-0000",
            required: true
          },
          {
            id: "address",
            type: "text", 
            title: "주소",
            required: false,
            condition: { field: "hasExperienced", value: "yes" }
          },
          {
            id: "emailForPrizes",
            type: "email",
            title: "이메일을 남겨주시면 설문 참여 경품 및 데스커 소식을 보내드립니다.",
            required: true
          },
          {
            id: "privacyAgreement",
            type: "checkbox",
            title: "개인정보 수집/이용 및 마케팅 활용에 동의합니다.",
            required: true,
            options: [
              { value: "true", label: "동의" }
            ]
          }
        ]
      }
    ]
  };

  const result = await createSurveySchema(defaultSchema);
  if (result.success) {
    return await getActiveSurveySchema();
  }
  return null;
};