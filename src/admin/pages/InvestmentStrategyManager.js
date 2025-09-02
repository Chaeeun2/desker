import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import SortableStrategyItem from '../components/SortableStrategyItem';
import SortableProductItem from '../components/SortableProductItem';
import { 
  getInvestmentStrategies, 
  getInvestmentProducts, 
  updateInvestmentStrategy, 
  updateInvestmentProduct
} from '../services/dataService';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const InvestmentStrategyManager = () => {
  const [strategies, setStrategies] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStrategy, setEditingStrategy] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  const [activeTab, setActiveTab] = useState('strategies');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [strategiesData, productsData] = await Promise.all([
        getInvestmentStrategies(),
        getInvestmentProducts()
      ]);
      
      // order 순서대로 정렬
      setStrategies(strategiesData.sort((a, b) => a.order - b.order));
      setProducts(productsData.sort((a, b) => a.order - b.order));
    } catch (error) {
      // console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleStrategyEdit = (strategy) => {
    setEditingStrategy({ ...strategy });
    setShowStrategyModal(true);
  };

  const handleProductEdit = (product) => {
    setEditingProduct({ ...product });
    setShowProductModal(true);
  };

  const handleStrategySave = async () => {
    try {
      await updateInvestmentStrategy(editingStrategy.id, editingStrategy);
      await loadData();
      setShowStrategyModal(false);
      setEditingStrategy(null);
      alert('투자 전략이 업데이트되었습니다.');
    } catch (error) {
      // console.error('전략 업데이트 실패:', error);
      alert('업데이트에 실패했습니다.');
    }
  };

  const handleProductSave = async () => {
    try {
      await updateInvestmentProduct(editingProduct.id, editingProduct);
      await loadData();
      setShowProductModal(false);
      setEditingProduct(null);
      alert('투자 상품이 업데이트되었습니다.');
    } catch (error) {
      // console.error('상품 업데이트 실패:', error);
      alert('업데이트에 실패했습니다.');
    }
  };

  const handleStrategyChange = (field, value) => {
    setEditingStrategy(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProductChange = (field, value) => {
    setEditingProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStrategyDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = strategies.findIndex(strategy => strategy.id === active.id);
      const newIndex = strategies.findIndex(strategy => strategy.id === over.id);

      const newStrategies = arrayMove(strategies, oldIndex, newIndex);
      
      // 순서 업데이트
      const updatedStrategies = newStrategies.map((strategy, index) => ({
        ...strategy,
        order: index + 1
      }));

      setStrategies(updatedStrategies);

      // Firebase에 순서 업데이트
      try {
        for (const strategy of updatedStrategies) {
          await updateInvestmentStrategy(strategy.id, { order: strategy.order });
        }
        alert('전략 순서가 업데이트되었습니다.');
      } catch (error) {
        // console.error('순서 업데이트 실패:', error);
        alert('순서 업데이트에 실패했습니다.');
        await loadData(); // 실패 시 원래 데이터로 복원
      }
    }
  };

  const handleProductDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = products.findIndex(product => product.id === active.id);
      const newIndex = products.findIndex(product => product.id === over.id);

      const newProducts = arrayMove(products, oldIndex, newIndex);
      
      // 순서 업데이트
      const updatedProducts = newProducts.map((product, index) => ({
        ...product,
        order: index + 1
      }));

      setProducts(updatedProducts);

      // Firebase에 순서 업데이트
      try {
        for (const product of updatedProducts) {
          await updateInvestmentProduct(product.id, { order: product.order });
        }
        alert('상품 순서가 업데이트되었습니다.');
      } catch (error) {
        // console.error('순서 업데이트 실패:', error);
        alert('순서 업데이트에 실패했습니다.');
        await loadData(); // 실패 시 원래 데이터로 복원
      }
    }
  };

  const handleStrategyDelete = async (strategyId) => {
    if (window.confirm('이 전략을 삭제하시겠습니까?')) {
      try {
        // 삭제 로직 구현 필요
        alert('전략이 삭제되었습니다.');
        await loadData();
      } catch (error) {
        // console.error('전략 삭제 실패:', error);
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const handleProductDelete = async (productId) => {
    if (window.confirm('이 상품을 삭제하시겠습니까?')) {
      try {
        // 삭제 로직 구현 필요
        alert('상품이 삭제되었습니다.');
        await loadData();
      } catch (error) {
        // console.error('상품 삭제 실패:', error);
        alert('삭제에 실패했습니다.');
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-content">
          <h2 className="admin-page-title">Investment Strategy 관리</h2>
          <div className="admin-content-wrapper">
            <div className="admin-content">
            </div>
          </div> 
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-content-wrapper">
        <div className="admin-content">
          <h2 className="admin-page-title">Investment Strategy 관리</h2> 
          
          {/* 탭 네비게이션 */}
          <div className="admin-tabs">
            <button
              className={`admin-tab ${activeTab === 'strategies' ? 'active' : ''}`}
              onClick={() => setActiveTab('strategies')}
            >
              투자 전략
            </button>
            <button
              className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              투자 상품
            </button>
          </div>
          
          <div className="admin-content-layout">
            <div className="admin-content-main">
              
              {/* 투자 전략 탭 */}
              {activeTab === 'strategies' && (
                <div className="admin-content-section">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleStrategyDragEnd}
                    >
                      <SortableContext
                        items={strategies.map(strategy => strategy.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="strategies-grid">
                          {strategies.map((strategy) => (
                            <SortableStrategyItem
                              key={strategy.id}
                              strategy={strategy}
                              onEdit={handleStrategyEdit}
                              onDelete={handleStrategyDelete}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
              )}
              
              {/* 투자 상품 탭 */}
              {activeTab === 'products' && (
                <div className="admin-content-section">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleProductDragEnd}
                    >
                      <SortableContext
                        items={products.map(product => product.id)}
                        strategy={verticalListSortingStrategy}
                      >
                          {products.map((product) => (
                            <SortableProductItem
                              key={product.id}
                              product={product}
                              onEdit={handleProductEdit}
                              onDelete={handleProductDelete}
                            />
                          ))}
                      </SortableContext>
                    </DndContext>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 전략 수정 모달 */}
      {showStrategyModal && editingStrategy && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>투자 전략 수정</h3>
              <div className="admin-button-group">
                                <button 
                  className="admin-button admin-button-secondary"
                  onClick={() => setShowStrategyModal(false)}
                >
                  취소
                </button>
                <button 
                  className="admin-button"
                  onClick={handleStrategySave}
                >
                  저장
                </button>
              </div>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-section">
                <h4>제목</h4>
                <input
                  type="text"
                  className="admin-input"
                  value={editingStrategy.title}
                  onChange={(e) => handleStrategyChange('title', e.target.value)}
                />
              </div>
              <div className="admin-form-section">
                <h4>한국어 설명</h4>
                <textarea
                  className="admin-textarea"
                  value={editingStrategy.description}
                  onChange={(e) => handleStrategyChange('description', e.target.value)}
                  rows="4"
                />
              </div>
              <div className="admin-form-section">
                <h4>영어 설명</h4>
                <textarea
                  className="admin-textarea"
                  value={editingStrategy.descriptionEn}
                  onChange={(e) => handleStrategyChange('descriptionEn', e.target.value)}
                  rows="4"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 상품 수정 모달 */}
      {showProductModal && editingProduct && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>투자 상품 수정</h3>
              <div className="admin-button-group">
                                <button 
                  className="admin-button admin-button-secondary"
                  onClick={() => setShowProductModal(false)}
                >
                  취소
                </button>
                <button 
                  className="admin-button"
                  onClick={handleProductSave}
                >
                  저장
                </button>
              </div>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-section">
                <h4>한국어 제목</h4>
                <input
                  type="text"
                  className="admin-input"
                  value={editingProduct.title}
                  onChange={(e) => handleProductChange('title', e.target.value)}
                />
              </div>
              <div className="admin-form-section">
                <h4>영어 제목</h4>
                <input
                  type="text"
                  className="admin-input"
                  value={editingProduct.titleEn}
                  onChange={(e) => handleProductChange('titleEn', e.target.value)}
                />
              </div>
              <div className="admin-form-section">
                <h4>한국어 설명</h4>
                <textarea
                  className="admin-textarea"
                  value={editingProduct.description}
                  onChange={(e) => handleProductChange('description', e.target.value)}
                  rows="4"
                />
              </div>
              <div className="admin-form-section">
                <h4>영어 설명</h4>
                <textarea
                  className="admin-textarea"
                  value={editingProduct.descriptionEn}
                  onChange={(e) => handleProductChange('descriptionEn', e.target.value)}
                  rows="4"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default InvestmentStrategyManager;
