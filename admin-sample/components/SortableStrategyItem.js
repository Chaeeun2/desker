import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableStrategyItem = React.memo(({ strategy, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: strategy.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="admin-leadership-item"
    >
      <div className="admin-leadership-item-content">
        <div 
          className="admin-leadership-item-drag-handle"
          {...attributes}
          {...listeners}
          style={{ cursor: 'grab', padding: '5px', marginRight: '5px' }}
        >
          ⠿
        </div>
        <div className="admin-leadership-item-info">
          <div className="admin-leadership-item-name">
            {strategy.title} 전략
          </div>
          <div className="admin-leadership-item-position">
            {strategy.description}
          </div>
        </div>
        <div className="admin-leadership-item-actions">
          <button
            type="button"
            className="admin-button"
            onClick={() => onEdit(strategy)}
          >
            수정
          </button>
          <button
            type="button"
            className="admin-button admin-button-secondary"
            onClick={() => onDelete(strategy.id)}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
});

SortableStrategyItem.displayName = 'SortableStrategyItem';

export default SortableStrategyItem;
