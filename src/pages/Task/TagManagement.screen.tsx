import React, { useState } from 'react';
import { Tag } from '../../types/task/response/tag.response';
import { GROUP_CLASSNAMES } from '../../styles';
import { TagManagementProps } from '../../types/task/props/component.props';
import Modal from 'react-modal';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const TagManagement: React.FC<TagManagementProps> = ({
  allTags,
  newTagName,
  setNewTagName,
  newTagColor,
  setNewTagColor,
  handleCreateNewTag,
  confirmDeleteTag,
  handleUpdateTag,
  setShowTagManagement,
}) => {
  const { t } = useAppTranslate();
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#3B82F6');
  const resetTagForm = () => {
    setNewTagName('');
    setNewTagColor('#3B82F6');
  };

  return (
    <Modal
      isOpen={true}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[450px] max-w-[90vw] bg-white rounded-2xl shadow-2xl z-[2000] outline-none"
      overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
    >
      {' '}
      <div className={GROUP_CLASSNAMES.taskModalContent}>
        {/* Header */}
        <div className={GROUP_CLASSNAMES.taskModalHeader}>
          <h3 className="text-lg font-medium text-gray-900">
            {t('manage_tags')}
          </h3>
          <button
            type="button"
            onClick={() => setShowTagManagement(false)}
            className={GROUP_CLASSNAMES.taskModalCloseButton}
            aria-label={t('close_tag_management')}
            title={t('close_tag_management')}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className={GROUP_CLASSNAMES.tagManagementContainer}>
          {/* Create new tag */}
          <div className={GROUP_CLASSNAMES.tagManagementSection}>
            <h3 className={GROUP_CLASSNAMES.tagManagementTitle}>
              {t('add_new_tag')}
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={t('tag_name_placeholder')}
                value={newTagName}
                onChange={e => {
                  if (e.target.value.length <= 25) {
                    setNewTagName(e.target.value);
                  }
                }}
                className={GROUP_CLASSNAMES.tagManagementInput}
                maxLength={25}
              />
              <input
                type="color"
                value={newTagColor}
                onChange={e => setNewTagColor(e.target.value)}
                className={GROUP_CLASSNAMES.tagManagementColorInput}
                aria-label={t('choose_tag_color')}
                title={t('choose_tag_color')}
              />

              <button
                type="button"
                onClick={() =>
                  handleCreateNewTag(newTagName, newTagColor, resetTagForm)
                }
                disabled={!newTagName.trim()}
                id="create-tag-button"
                className={`${GROUP_CLASSNAMES.tagManagementButton} ${
                  newTagName.trim()
                    ? GROUP_CLASSNAMES.tagManagementButtonActive
                    : GROUP_CLASSNAMES.tagManagementButtonDisabled
                }`}
              >
                {t('add')}
              </button>
            </div>
            {/* Helper text for tag name length */}
            <div className="text-xs text-gray-400 mt-1">
              {newTagName.length}/25 {t('characters')}
            </div>
            {newTagName.length === 25 && (
              <div className="text-red-500 text-xs mt-1">
                {t('tag_name_exceed_limit')}
              </div>
            )}
          </div>

          {/* List of existing tags */}
          <div>
            <h3 className={GROUP_CLASSNAMES.tagManagementTitle}>
              {t('your_tags')}
            </h3>
            {allTags.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center border border-gray-200 rounded-md bg-gray-50">
                <svg
                  className="h-10 w-10 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <p className="text-gray-500 text-sm">
                  {t('no_tags_available_create_first')}
                </p>
              </div>
            ) : (
              <ul className={GROUP_CLASSNAMES.tagManagementList}>
                {allTags.map(tag => (
                  <li
                    key={tag._id}
                    className={GROUP_CLASSNAMES.tagManagementListItem}
                  >
                    {editingTagId === tag._id ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={editName}
                          onChange={e => e.target.value.length <= 25 && setEditName(e.target.value)}
                          className={GROUP_CLASSNAMES.tagManagementInput}
                          maxLength={25}
                        />
                        <input
                          type="color"
                          value={editColor}
                          onChange={e => setEditColor(e.target.value)}
                          className={GROUP_CLASSNAMES.tagManagementColorInput}
                          aria-label={t('choose_tag_color')}
                          title={t('choose_tag_color')}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            className={`${GROUP_CLASSNAMES.tagManagementButton} ${GROUP_CLASSNAMES.tagManagementButtonActive}`}
                            onClick={async () => {
                              const ok = await handleUpdateTag(tag._id, { name: editName.trim(), color: editColor });
                              if (ok) {
                                alert(t('tag_update_success'));
                                setEditingTagId(null);
                              } else {
                                alert(t('tag_update_failed'));
                              }
                            }}
                          >
                            {t('save')}
                          </button>
                          <button
                            className={`${GROUP_CLASSNAMES.tagManagementButton}`}
                            onClick={() => setEditingTagId(null)}
                          >
                            {t('cancel')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center w-full justify-between">
                        <div className="flex items-center">
                          <span
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: tag.color }}
                          ></span>
                          <span className="text-sm font-medium">{tag.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingTagId(tag._id);
                              setEditName(tag.name);
                              setEditColor(tag.color || '#3B82F6');
                            }}
                            className={GROUP_CLASSNAMES.tagManagementDeleteButton}
                            title={t('edit')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5h2M12 7v10m9-5a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => confirmDeleteTag(tag)}
                            className={GROUP_CLASSNAMES.tagManagementDeleteButton}
                            title={t('delete_tag')}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TagManagement;
