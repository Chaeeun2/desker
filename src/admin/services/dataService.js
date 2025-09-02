// Firebase 데이터 서비스
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  writeBatch,
  serverTimestamp,
  onSnapshot,
  setDoc
} from '@firebase/firestore';
import { db } from '../lib/firebase';

// 컬렉션 이름들
const COLLECTIONS = {
  OVERVIEW: 'overview',
  LEADERSHIP: 'leadership',
  CONTACT: 'contact',
  NEWS: 'news',
  PORTFOLIO: 'portfolio',
  DISCLOSURE: 'disclosure',
  INVESTMENT_STRATEGY: 'investment-strategy',
  ORGANIZATION: 'organization',
  RISK_COMPLIANCE: 'risk-compliance'
};

export const dataService = {
  // 컬렉션 참조 가져오기
  getCollectionRef(collectionName) {
    return collection(db, collectionName);
  },

  // 문서 참조 가져오기
  getDocRef(collectionName, docId) {
    return doc(db, collectionName, docId);
  },

  // 모든 문서 가져오기
  async getAllDocuments(collectionName, orderByField = null, orderDirection = 'asc') {
    try {
      let q = this.getCollectionRef(collectionName);
      
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection));
      }
      
      const querySnapshot = await getDocs(q);
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        success: true,
        data: documents,
        count: documents.length
      };
    } catch (error) {
      // console.error(`문서 조회 오류 (${collectionName}):`, error);
      throw error;
    }
  },

  // 단일 문서 가져오기
  async getDocument(collectionName, docId) {
    try {
      const docRef = this.getDocRef(collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          success: true,
          data: {
            id: docSnap.id,
            ...docSnap.data()
          }
        };
      } else {
        return {
          success: false,
          error: '문서를 찾을 수 없습니다.'
        };
      }
    } catch (error) {
      // console.error(`문서 조회 오류 (${collectionName}/${docId}):`, error);
      throw error;
    }
  },

  // 문서 추가
  async addDocument(collectionName, data) {
    try {
      const docRef = await addDoc(this.getCollectionRef(collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return {
        success: true,
        data: {
          id: docRef.id,
          ...data
        }
      };
    } catch (error) {
      // console.error(`문서 추가 오류 (${collectionName}):`, error);
      throw error;
    }
  },

  // 문서 설정 (존재하지 않으면 생성, 존재하면 업데이트)
  async setDocument(collectionName, docId, data) {
    try {
      const docRef = this.getDocRef(collectionName, docId);
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      return {
        success: true,
        data: {
          id: docId,
          ...data
        }
      };
    } catch (error) {
      // console.error(`문서 설정 오류 (${collectionName}/${docId}):`, error);
      throw error;
    }
  },

  // 문서 업데이트
  async updateDocument(collectionName, docId, data) {
    try {
      const docRef = this.getDocRef(collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      return {
        success: true,
        data: {
          id: docId,
          ...data
        }
      };
    } catch (error) {
      // console.error(`문서 업데이트 오류 (${collectionName}/${docId}):`, error);
      throw error;
    }
  },

  // 문서 삭제
  async deleteDocument(collectionName, docId) {
    try {
      const docRef = this.getDocRef(collectionName, docId);
      await deleteDoc(docRef);
      
      return {
        success: true,
        message: '문서가 삭제되었습니다.'
      };
    } catch (error) {
      // console.error(`문서 삭제 오류 (${collectionName}/${docId}):`, error);
      throw error;
    }
  },

  // 여러 문서 삭제
  async deleteMultipleDocuments(collectionName, docIds) {
    try {
      const batch = writeBatch(db);
      
      docIds.forEach(docId => {
        const docRef = this.getDocRef(collectionName, docId);
        batch.delete(docRef);
      });
      
      await batch.commit();
      
      return {
        success: true,
        message: `${docIds.length}개의 문서가 삭제되었습니다.`
      };
    } catch (error) {
      // console.error(`여러 문서 삭제 오류 (${collectionName}):`, error);
      throw error;
    }
  },

  // 쿼리로 문서 가져오기
  async queryDocuments(collectionName, conditions = [], orderByField = null, orderDirection = 'asc', limitCount = null) {
    try {
      let q = this.getCollectionRef(collectionName);
      
      // 조건 적용
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
      
      // 정렬 적용
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection));
      }
      
      // 제한 적용
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        success: true,
        data: documents,
        count: documents.length
      };
    } catch (error) {
      // console.error(`쿼리 문서 조회 오류 (${collectionName}):`, error);
      throw error;
    }
  },

  // 페이지네이션으로 문서 가져오기
  async getDocumentsWithPagination(collectionName, pageSize = 10, lastDoc = null, orderByField = 'createdAt', orderDirection = 'desc') {
    try {
      let q = this.getCollectionRef(collectionName);
      
      // 정렬 적용
      q = query(q, orderBy(orderByField, orderDirection), limit(pageSize));
      
      // 마지막 문서부터 시작
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      
      const querySnapshot = await getDocs(q);
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        success: true,
        data: documents,
        count: documents.length,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        hasMore: documents.length === pageSize
      };
    } catch (error) {
      // console.error(`페이지네이션 문서 조회 오류 (${collectionName}):`, error);
      throw error;
    }
  },

  // 실시간 리스너 설정
  subscribeToCollection(collectionName, callback, conditions = [], orderByField = null, orderDirection = 'asc') {
    try {
      let q = this.getCollectionRef(collectionName);
      
      // 조건 적용
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
      
      // 정렬 적용
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection));
      }
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const documents = [];
        querySnapshot.forEach((doc) => {
          documents.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        callback({
          success: true,
          data: documents,
          count: documents.length
        });
      }, (error) => {
        // console.error(`실시간 리스너 오류 (${collectionName}):`, error);
        callback({
          success: false,
          error: error.message
        });
      });
      
      return unsubscribe;
    } catch (error) {
      // console.error(`실시간 리스너 설정 오류 (${collectionName}):`, error);
      throw error;
    }
  },

  // Overview 데이터 관리
  overview: {
    async getAll() {
      try {
        const querySnapshot = await getDocs(collection(db, COLLECTIONS.OVERVIEW));
        const documents = [];
        querySnapshot.forEach((doc) => {
          documents.push({
            id: doc.id,
            ...doc.data()
          });
        });
        return documents;
      } catch (error) {
        // console.error('Overview 데이터 조회 오류:', error);
        throw error;
      }
    },

    async add(data) {
      try {
        const docRef = await addDoc(collection(db, COLLECTIONS.OVERVIEW), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return {
          id: docRef.id,
          ...data
        };
      } catch (error) {
        // console.error('Overview 데이터 추가 오류:', error);
        throw error;
      }
    },

    async update(id, data) {
      try {
        const docRef = doc(db, COLLECTIONS.OVERVIEW, id);
        await updateDoc(docRef, {
          ...data,
          updatedAt: serverTimestamp()
        });
        return {
          id,
          ...data
        };
      } catch (error) {
        // console.error('Overview 데이터 업데이트 오류:', error);
        throw error;
      }
    },

    async delete(id) {
      try {
        const docRef = doc(db, COLLECTIONS.OVERVIEW, id);
        await deleteDoc(docRef);
        return true;
      } catch (error) {
        // console.error('Overview 데이터 삭제 오류:', error);
        throw error;
      }
    }
  },

  // Leadership 데이터 관리
  leadership: {
    async getAll() {
      try {
        const querySnapshot = await getDocs(collection(db, COLLECTIONS.LEADERSHIP));
        const documents = [];
        querySnapshot.forEach((doc) => {
          documents.push({
            id: doc.id,
            ...doc.data()
          });
        });
        return documents;
      } catch (error) {
        // console.error('Leadership 데이터 조회 오류:', error);
        throw error;
      }
    },

    async add(data) {
      try {
        const docRef = await addDoc(collection(db, COLLECTIONS.LEADERSHIP), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return {
          id: docRef.id,
          ...data
        };
      } catch (error) {
        // console.error('Leadership 데이터 추가 오류:', error);
        throw error;
      }
    },

    async update(id, data) {
      try {
        const docRef = doc(db, COLLECTIONS.LEADERSHIP, id);
        await updateDoc(docRef, {
          ...data,
          updatedAt: serverTimestamp()
        });
        return {
          id,
          ...data
        };
      } catch (error) {
        // console.error('Leadership 데이터 업데이트 오류:', error);
        throw error;
      }
    },

    async delete(id) {
      try {
        const docRef = doc(db, COLLECTIONS.LEADERSHIP, id);
        await deleteDoc(docRef);
        return true;
      } catch (error) {
        // console.error('Leadership 데이터 삭제 오류:', error);
        throw error;
      }
    }
  },

  // Contact 데이터 관리
  contact: {
    async get() {
      try {
        const docRef = doc(db, COLLECTIONS.CONTACT, 'main');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          return docSnap.data();
        } else {
          // 문서가 없으면 기본값 반환
          return {
            addressKo: '',
            addressEn: '',
            phone: '',
            fax: '',
            email: ''
          };
        }
      } catch (error) {
        // console.error('Contact 데이터 조회 오류:', error);
        throw error;
      }
    },

    async update(data) {
      try {
        const docRef = doc(db, COLLECTIONS.CONTACT, 'main');
        await setDoc(docRef, {
          ...data,
          updatedAt: serverTimestamp()
        }, { merge: true });
        return data;
      } catch (error) {
        // console.error('Contact 데이터 업데이트 오류:', error);
        throw error;
      }
    }
  },

  // Investment Strategy 데이터 관리
  async getInvestmentStrategyData() {
    return await this.getDocument(COLLECTIONS.INVESTMENT_STRATEGY, 'main');
  },

  async updateInvestmentStrategyData(data) {
    return await this.updateDocument(COLLECTIONS.INVESTMENT_STRATEGY, 'main', data);
  },

  // Investment Process 데이터 관리
  async getInvestmentProcessData() {
    return await this.getDocument(COLLECTIONS.INVESTMENT_PROCESS, 'main');
  },

  async updateInvestmentProcessData(data) {
    return await this.updateDocument(COLLECTIONS.INVESTMENT_PROCESS, 'main', data);
  },

  // Portfolio 데이터 관리
  async getPortfolioData() {
    try {
      const result = await this.getAllDocuments(COLLECTIONS.PORTFOLIO);
      if (result.success) {

        
        // 실제 포트폴리오 항목만 필터링 (categories, operational-status, total-amount 제외)
        const portfolioItems = result.data.filter(item => {
          // 시스템 문서들 제외
          if (item.id === 'categories' || item.id === 'operational-status' || item.id === 'total-amount') {
            return false;
          }
          
          // 필수 필드가 없는 항목 제외
          if (!item.titleKo || !item.category) {
            return false;
          }
          
          // 포트폴리오 항목으로 인정
          return true;
        });
        

        
        // order 필드가 없는 경우 createdAt으로 정렬
        const sortedData = portfolioItems.sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          } else if (a.order !== undefined) {
            return -1; // order가 있는 항목을 앞으로
          } else if (b.order !== undefined) {
            return 1; // order가 있는 항목을 앞으로
          } else {
            // 둘 다 order가 없는 경우 createdAt으로 정렬
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return dateB - dateA; // 최신 항목을 앞으로
          }
        });
        
        return {
          success: true,
          data: sortedData,
          count: sortedData.length
        };
      }
      return result;
    } catch (error) {
      // console.error('Portfolio 데이터 조회 오류:', error);
      throw error;
    }
  },

  async addPortfolioItem(data) {
    return await this.addDocument(COLLECTIONS.PORTFOLIO, data);
  },

  async updatePortfolioItem(docId, data) {
    return await this.updateDocument(COLLECTIONS.PORTFOLIO, docId, data);
  },

  async deletePortfolioItem(docId) {
    return await this.deleteDocument(COLLECTIONS.PORTFOLIO, docId);
  },

  // News 데이터 관리
  async getNewsData() {
    return await this.getAllDocuments(COLLECTIONS.NEWS, 'date', 'desc');
  },

  async addNewsItem(data) {
    return await this.addDocument(COLLECTIONS.NEWS, data);
  },

  async updateNewsItem(docId, data) {
    return await this.updateDocument(COLLECTIONS.NEWS, docId, data);
  },

  async deleteNewsItem(docId) {
    return await this.deleteDocument(COLLECTIONS.NEWS, docId);
  },

  // Risk & Compliance 데이터 관리
  async getRiskComplianceData() {
    return await this.getDocument(COLLECTIONS.RISK_COMPLIANCE, 'main');
  },

  async updateRiskComplianceData(data) {
    return await this.updateDocument(COLLECTIONS.RISK_COMPLIANCE, 'main', data);
  },

  // Organization 데이터 관리
  async getOrganizationData() {
    return await this.getDocument(COLLECTIONS.ORGANIZATION, 'main');
  },

  async updateOrganizationData(data) {
    return await this.updateDocument(COLLECTIONS.ORGANIZATION, 'main', data);
  },

  // Disclosure 데이터 관리
  async getDisclosureData() {
    return await this.getAllDocuments(COLLECTIONS.DISCLOSURE, 'date', 'desc');
  },

  async addDisclosureItem(data) {
    return await this.addDocument(COLLECTIONS.DISCLOSURE, data);
  },

  async updateDisclosureItem(docId, data) {
    return await this.updateDocument(COLLECTIONS.DISCLOSURE, docId, data);
  },

  async deleteDisclosureItem(docId) {
    return await this.deleteDocument(COLLECTIONS.DISCLOSURE, docId);
  }
};

// Investment Strategy 관련 함수들
export const getInvestmentStrategies = async () => {
  try {
    const strategiesRef = collection(db, 'investmentStrategies');
    const snapshot = await getDocs(strategiesRef);
    const strategies = [];
    snapshot.forEach((doc) => {
      strategies.push({ id: doc.id, ...doc.data() });
    });
    return strategies;
  } catch (error) {
    // console.error('투자 전략 조회 실패:', error);
    throw error;
  }
};

export const getInvestmentStrategy = async (id) => {
  try {
    const strategyRef = doc(db, 'investmentStrategies', id);
    const strategyDoc = await getDoc(strategyRef);
    if (strategyDoc.exists()) {
      return { id: strategyDoc.id, ...strategyDoc.data() };
    }
    return null;
  } catch (error) {
    // console.error('투자 전략 조회 실패:', error);
    throw error;
  }
};

export const updateInvestmentStrategy = async (id, data) => {
  try {
    const strategyRef = doc(db, 'investmentStrategies', id);
    await updateDoc(strategyRef, {
      ...data,
      updatedAt: serverTimestamp()
    });

  } catch (error) {
    // console.error('투자 전략 업데이트 실패:', error);
    throw error;
  }
};

export const createInvestmentStrategy = async (data) => {
  try {
    const strategiesRef = collection(db, 'investmentStrategies');
    const docRef = await addDoc(strategiesRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    // console.error('투자 전략 생성 실패:', error);
    throw error;
  }
};

// Investment Products 관련 함수들
export const getInvestmentProducts = async () => {
  try {
    const productsRef = collection(db, 'investmentProducts');
    const snapshot = await getDocs(productsRef);
    const products = [];
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    return products;
  } catch (error) {
    // console.error('투자 상품 조회 실패:', error);
    throw error;
  }
};

export const getInvestmentProduct = async (id) => {
  try {
    const productRef = doc(db, 'investmentProducts', id);
    const productDoc = await getDoc(productRef);
    if (productDoc.exists()) {
      return { id: productDoc.id, ...productDoc.data() };
    }
    return null;
  } catch (error) {
    // console.error('투자 상품 조회 실패:', error);
    throw error;
  }
};

export const updateInvestmentProduct = async (id, data) => {
  try {
    const productRef = doc(db, 'investmentProducts', id);
    await updateDoc(productRef, {
      ...data,
      updatedAt: serverTimestamp()
    });

  } catch (error) {
    // console.error('투자 상품 업데이트 실패:', error);
    throw error;
  }
};

export const createInvestmentProduct = async (data) => {
  try {
    const productsRef = collection(db, 'investmentProducts');
    const docRef = await addDoc(productsRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    // console.error('투자 상품 생성 실패:', error);
    throw error;
  }
};

// 초기 데이터 설정 함수
export const initializeInvestmentData = async () => {
  try {
    // 전략 데이터 초기화
    const strategiesData = [
      {
        type: 'core',
        title: 'Core',
        titleSuffix: '전략',
        description: '우수한 스펙 및 입지 등을 보유한 안정화된 우량 자산에 대한 투자',
        descriptionEn: 'Investment in high-quality real estate assets in prime location, featuring strong building specifications and offering stable return profile to investors.',
        order: 1
      },
      {
        type: 'corePlus',
        title: 'Core Plus',
        titleSuffix: '전략',
        description: '임차인 리테넌팅 및 공실해소 등을 통해 운용자산의 Core 달성을 목표로 하는 투자',
        descriptionEn: 'Investment in well-located real estate assets with the potential to be repositioned as core profile through re-leasing, reducing vacancy or enhancing operational efficiency.',
        order: 2
      },
      {
        type: 'valueAdd',
        title: 'Value Add',
        titleSuffix: '전략',
        description: '물리적 개선공사, 운영현황 개선 등을 통하여 잠재가치 대비 저평가된 자산에 대한 벨류업 투자',
        descriptionEn: 'Investment in undervalued real estate assets with value creation potential through strategic capital expenditure, operational improvements or active asset management.',
        order: 3
      },
      {
        type: 'opportunistic',
        title: 'Opportunistic',
        titleSuffix: '전략',
        description: '개발, 재개발, 리모델링 등을 진행하는 고위험자산에 대한 수익률 극대화 추구의 투자',
        descriptionEn: 'Investment in high-risk, high-return real estate projects involving ground-up development, redevelopment, remodeling or major capital expenditure.',
        order: 4
      }
    ];

    // 상품 데이터 초기화
    const productsData = [
      {
        type: 'leasehold',
        title: '임대형 부동산펀드',
        titleEn: 'Real Estate Equity Fund',
        description: '상업용 부동산(오피스, 물류센터, 리테일, 호텔, 임대주택 등) 매입 후 펀드기간 동안의 운용수익 및 향후 자산가치 증대에 따른 매각차익 등을 목표로 하는 상품',
        descriptionEn: 'Investment in income-generating commercial real estate assets, aiming to deliver target returns through steady operating income over the fund life and capital appreciation upon exit (office, logistics center, retail, hotel, rental housing, etc.)',
        order: 1
      },
      {
        type: 'development',
        title: '개발형 부동산펀드',
        titleEn: 'Real Estate Development Fund',
        description: '상업용 부동산의 개발사업을 추진하여 분양 또는 준공 후 안정화 시 매각 등의 전략을 통하여 부동산의 개발이익을 목표로 하는 상품',
        descriptionEn: 'Investment in real estate development projects, targeting development profits through various exit strategy including pre-sale and sales upon stabilization.',
        order: 2
      },
      {
        type: 'loan',
        title: '대출형 부동산펀드',
        titleEn: 'Real Estate Debt Fund',
        description: '상업용 부동산의 개발 또는 운용 목적의 법인 또는 부동산 투자 Vehicle 등에 대출하여 대출이자수익을 목표로 하는 상품',
        descriptionEn: 'Investment in real estate investment vehicles or corporations in the form of real estate-backed debt or loans, generating stable interest income.',
        order: 3
      },
      {
        type: 'securities',
        title: '증권형 부동산펀드',
        titleEn: 'Real Estate Securities Fund',
        description: '상업용 부동산 법인 또는 기타 부동산 투자 Vehicle 등이 보유/발행하는 지분증권 등에 투자하는 상품',
        descriptionEn: 'Investment in securities or shares issued by commercial real estate corporations, REITs, or other real estate investment vehicles.',
        order: 4
      }
    ];

    // 전략 데이터 저장
    for (const strategy of strategiesData) {
      await createInvestmentStrategy(strategy);
    }

    // 상품 데이터 저장
    for (const product of productsData) {
      await createInvestmentProduct(product);
    }


  } catch (error) {
    // console.error('투자 데이터 초기화 실패:', error);
    throw error;
  }
};
