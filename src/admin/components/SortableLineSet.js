import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableLineSet = React.memo(({ type, index, koValue, enValue, onKoChange, onEnChange, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${type}-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`admin-form-${type}-set ${isDragging ? 'dragging' : ''}`}
    >
      <div 
        className="admin-form-drag-handle"
        {...attributes}
        {...listeners}
        style={{ cursor: 'grab', padding: '4px', color: '#999' }}
      >
        ⠿
      </div>
      <div className="admin-form-line-inputs">
        <input
          type="text"
          className="admin-input"
          value={koValue}
          onChange={onKoChange}
          placeholder={`${type === 'experience' ? '경력' : '학력'} ${index + 1} (국문)`}
        />
        <input
          type="text"
          className="admin-input"
          value={enValue}
          onChange={onEnChange}
          placeholder={`${type === 'experience' ? '경력' : '학력'} ${index + 1} (영문)`}
        />
        <button
          type="button"
          className="admin-button delete-line"
          onClick={onDelete}
        >
          ×
        </button>
      </div>
    </div>
  );
});

SortableLineSet.displayName = 'SortableLineSet';

export default SortableLineSet;
