/**
 * File chứa các className phức tạp dùng chung trong ứng dụng
 */

export const GROUP_CLASSNAMES = {
  transition: 'transition-all duration-300',
  transitionColors: 'transition-colors duration-300',
  transitionTransform: 'transition-transform duration-300 ease-out',

  // Card và container styles
  cardContainer:
    'bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border border-gray-100 dark:border-gray-700 overflow-hidden group',
  modalContainer:
    'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] max-w-[90vw] bg-white rounded-2xl shadow-2xl z-[3000] outline-none',
  modalOverlay: 'fixed inset-0 bg-black/40 backdrop-blur-sm z-[3000]',
  friendCardContainer:
    'p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center justify-between',
  emptyStateContainer:
    'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-8 text-center border border-blue-100 dark:border-gray-700',
  emptyStatePendingContainer:
    'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-8 text-center border border-yellow-100 dark:border-gray-700',
  emptyStateSentContainer:
    'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-8 text-center border border-purple-100 dark:border-gray-700',
  sidebarContainer:
    'w-72 border-r border-gray-200 dark:border-gray-700 p-5 flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-lg',

  // Flex layouts
  flexItemsCenter: 'flex items-center',
  flexItemsCenterSpace: 'flex items-center space-x-4',
  flexColGap: 'flex flex-col gap-4',
  flexJustifyBetween: 'flex justify-between items-center',
  flexCenterCenter: 'flex justify-center items-center',

  // Grid layouts
  gridResponsive: 'grid grid-cols-1 md:grid-cols-2 gap-4',

  // Loading và animation
  loadingSpinner:
    'animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent',
  loadingSpinnerSmall:
    'animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent',
  loadingSpinnerLarge:
    'animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500',
  animatePulse: 'animate-pulse flex items-center space-x-4',

  // Avatar styles
  avatarLarge:
    'inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white mb-6 shadow-md',
  avatarMedium:
    'w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-md transform transition-transform group-hover:scale-105',
  avatarSmall:
    'w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold mr-4',
  avatarYellow:
    'inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white mb-6 shadow-md',
  avatarPurple:
    'inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 text-white mb-6 shadow-md',

  // Form elements
  formInput: 'w-full transition-all duration-300',
  inputTransparent:
    'w-full h-full bg-transparent px-3 pt-4 pb-4 outline-none text-gray-900 disabled:bg-gray-100',
  searchInput:
    'block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-gray-50',
  authInput:
    'w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
  friendSearchInput:
    'pl-10 p-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
  friendFilterInput:
    'p-3 w-40 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white',

  // Button styles
  buttonPrimary:
    'px-4 py-3  text-white rounded-xl font-medium hover:bg-[#1a8fa3] disabled:bg-gray-300 disabled:text-gray-400 transition-colors',
  buttonSecondary:
    'px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 disabled:bg-gray-300 disabled:text-gray-400 transition-colors',
  buttonSuccess:
    'px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-1 shadow-sm hover:shadow-md transform hover:-translate-y-0.5',
  buttonFilter:
    'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md flex items-center',
  buttonAddTask:
    'bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-md flex items-center shadow-sm transition-colors',
  authButtonPrimary:
    'w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors',
  authButtonGoogle:
    'w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex justify-center items-center gap-2',
  buttonRefresh:
    'px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg',
  buttonSearch:
    'px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg',
  buttonCancel:
    'px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg',
  buttonAdd:
    'px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors duration-300 flex items-center gap-1 shadow-sm hover:shadow-md',
  buttonRemoveFriend:
    'p-2 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-200 flex items-center gap-1 border border-gray-200 dark:border-gray-600 shadow-sm group-hover:shadow-md',
  buttonPurple:
    'mt-6 px-5 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-full font-medium hover:from-purple-600 hover:to-violet-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center mx-auto',
  buttonRemove:
    'px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors duration-300 flex items-center gap-1 shadow-sm hover:shadow-md',
  buttonAccept:
    'px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors duration-300 flex items-center gap-1 shadow-sm hover:shadow-md',

  // Badge styles
  badgeSuccess:
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  badgeWarning:
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  badgeCount:
    'bg-red-100 text-red-800 text-xs font-medium rounded-full px-2 py-0.5',

  // Menu styles
  dropdownMenu:
    'absolute right-0 mt-1 bg-white rounded-md shadow-lg z-10 py-1 animate-fade-in',
  dropdownItem: 'px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer',

  // Status indicator
  statusIndicator:
    'text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full',
  errorMessage: 'p-2 bg-red-100 text-red-700 rounded-md',
  errorAlert:
    'mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md dark:bg-red-900/30 dark:border-red-700 animate-fadeIn',
  loadingAlert:
    'mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg shadow-md dark:bg-blue-900/30 dark:border-blue-700',

  // Link styles
  linkHover: 'text-blue-500 hover:underline cursor-pointer',

  // Gradient styles
  gradientBar: 'h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full',
  gradientBluePurple: 'bg-gradient-to-r from-blue-500 to-indigo-600',
  gradientGreenEmerald: 'bg-gradient-to-r from-green-500 to-emerald-600',
  gradientYellowAmber: 'bg-gradient-to-r from-yellow-400 to-amber-500',
  gradientPurpleViolet: 'bg-gradient-to-r from-purple-500 to-violet-500',

  // Header styles
  sectionHeader:
    'text-md font-semibold text-gray-700 dark:text-gray-300 capitalize border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center',

  // Common utility classes
  selectNone: 'select-none',
  selectText: 'select-text',
  absoluteCenter: 'absolute right-3 top-1/2 -translate-y-1/2',
  divider: 'border-t border-gray-100',

  // Layout containers
  pageContainer: 'min-h-screen bg-gray-50',
  contentContainer: ' px-8 py-6',
  headerContainer: 'bg-white shadow-sm border-b rounded-xl border-gray-200',

  // Profile and Login Session styles
  profileSidebar: 'w-1/6 bg-white',
  profileSidebarButton:
    'w-full text-left flex justify-between items-center py-2 px-3 rounded hover:bg-gray-100',
  profileSidebarButtonActive: 'bg-gray-200 font-bold text-xl',
  profileSidebarButtonInactive: 'text-gray-500',
  profileMainContent: 'flex-1 overflow-y-auto',
  profileSection: 'text-xl font-medium text-gray-900 mb-4',

  // Session cards
  sessionCard:
    'flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 mb-4',
  sessionCardIcon:
    'w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center',
  sessionCardContent: 'flex items-center space-x-4',
  sessionCardText: 'font-medium text-gray-900',
  sessionCardSubtext: 'text-sm text-gray-500',
  sessionCardCurrentBadge:
    'text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full',

  // Buttons for sessions
  sessionLogoutButton: 'text-sm text-gray-600 hover:text-gray-900',
  sessionLogoutAllButton:
    'text-sm text-gray-600 hover:text-gray-900 bg-gray-100 px-4 py-2 rounded-lg',
  sessionShowMoreButton:
    'w-full text-center text-sm text-blue-600 hover:text-blue-800 mt-2 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors',

  // Modal styles
  modalOverlayProfile: 'fixed inset-0 z-50 flex items-center justify-center',
  modalContentProfile: 'bg-white rounded-lg p-6 w-96 shadow-xl',
  modalButtonCancel:
    'px-4 py-2 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors',
  modalButtonConfirm:
    'px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors',

  // Task page styles
  taskModalOverlay:
    'fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50',
  taskModalContent: 'relative bg-white rounded-lg shadow-xl overflow-hidden',
  taskModalHeader:
    'flex justify-between items-center px-4 py-3 border-b border-gray-100 border-opacity-30',
  taskModalFooter: 'px-6 py-4 bg-gray-50 flex justify-end space-x-3',
  taskModalCloseButton:
    'absolute top-4 right-4 text-gray-400 hover:text-gray-500',
  taskDetailHeader: 'px-6 pt-6 pb-3',
  taskDetailDescription: 'px-6 pb-4 border-b border-gray-100 border-opacity-30',
  taskDetailSection: 'px-6 py-2 border-t border-gray-100',
  taskDetailFooter:
    'px-6 py-4 border-t border-gray-200 flex justify-between items-center',

  taskListContainer: 'bg-white rounded-lg shadow',
  taskListItem:
    ' py-3 px-2 hover:bg-gray-50 cursor-pointer transition-colors group',
  taskCheckbox:
    'flex-shrink-0 mt-1 w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer transition-colors',
  taskCheckboxCompleted: 'bg-green-500 border-green-500 text-white',
  taskCheckboxOverdue: 'border-red-400 hover:border-red-500',
  taskCheckboxPending: 'border-gray-400 hover:border-green-500',
  taskTitle: 'text-sm font-medium truncate',
  taskTitleCompleted: 'line-through text-gray-500',
  taskTitlePending: 'text-gray-900',
  taskDescription: 'mt-1 text-sm text-gray-500 line-clamp-1',
  taskTagContainer: 'mt-2 flex items-center',
  taskTag: 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
  taskPriorityBadge:
    'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium',
  taskPriorityHigh: 'bg-red-100 text-red-800',
  taskPriorityMedium: 'bg-yellow-100 text-yellow-800',
  taskPriorityLow: 'bg-green-100 text-green-800',
  taskStatusBadge: 'px-2 py-0.5 rounded-full text-xs font-medium',
  taskStatusCompleted: 'bg-green-100 text-green-800',
  taskStatusOverdue: 'bg-red-100 text-red-800',
  taskStatusPending: 'bg-yellow-100 text-yellow-800',

  taskActionButton: 'text-gray-400 hover:text-gray-600 mr-2',
  taskDeleteButton: 'text-gray-400 hover:text-red-500',

  taskEmptyState: 'text-center py-12',
  taskEmptyIcon: 'mx-auto h-12 w-12 text-gray-400',
  taskEmptyTitle: 'mt-2 text-xl font-medium text-gray-900',
  taskEmptyDescription: 'mt-1 text-sm text-gray-500',
  taskEmptyAction: 'mt-6',

  // Tag management styles - Apple Design
  tagContainer: 'flex flex-wrap gap-2',
  tagItem: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
  tagManagementContainer: 'px-6 py-6 space-y-6',
  tagManagementSection: 'space-y-3',
  tagManagementTitle: 'text-sm font-semibold text-gray-900 tracking-tight',
  tagManagementInput:
    'flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all',
  tagManagementColorInput: 'w-11 h-11 border-0 p-0 cursor-pointer rounded-xl shadow-sm hover:shadow-md transition-shadow',
  tagManagementButton: 'px-4 py-2 rounded-lg text-sm font-medium transition-all',
  tagManagementButtonActive: 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95',
  tagManagementButtonDisabled: 'bg-gray-100 text-gray-400 cursor-not-allowed',
  tagManagementList:
    'mt-4 max-h-80 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent',
  tagManagementListItem:
    'py-3 px-4 flex items-center justify-between hover:bg-gray-50 rounded-xl transition-all duration-200 group',
  tagManagementDeleteButton:
    'text-gray-400 hover:text-blue-500 p-1.5 rounded-lg hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100',

  // Delete confirmation modal
  deleteConfirmModal: 'bg-white rounded-lg shadow-xl p-5 max-w-[90vw]',
  deleteConfirmIcon:
    'w-10 h-10 rounded-full bg-red-100 flex items-center justify-center',
  deleteConfirmIconSvg: 'h-6 w-6 text-red-600',
  deleteConfirmTitle: 'text-xl font-medium text-center text-gray-900 mb-2',
  deleteConfirmDescription: 'text-sm text-center text-gray-500 mb-4',
  deleteConfirmButtons: 'flex justify-center space-x-3',
  deleteConfirmCancelButton:
    'px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50',
  deleteConfirmDeleteButton:
    'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700',

  // Friend search components
  friendSearchContainer:
    'bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6',
  friendSearchInputInner: 'relative flex-1 min-w-[200px]',
  friendSearchInputIcon:
    'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none',
  friendSearchInputField:
    'pl-10 p-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
  friendLoadingContainer: 'flex justify-center items-center p-8',
  friendSearchResultsContainer: 'space-y-4',
  friendSearchResultsHeader: 'flex justify-between items-center',
  friendSearchResultsGrid: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  friendSearchResultCard:
    'p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center justify-between',
  friendSearchResultCardInner: 'flex items-center',
  friendSearchResultCardAvatar: 'flex items-center',
  friendSearchResultCardInfo: 'flex flex-col',
  friendSearchResultCardName:
    'font-medium text-xl text-gray-900 dark:text-white',
  friendSearchResultCardSelf: 'text-sm text-gray-500 dark:text-gray-400 mt-1',
  friendSearchResultCardPending:
    'text-sm text-yellow-500 dark:text-yellow-400 mt-1 flex items-center',
  friendSearchResultCardSent:
    'text-sm text-blue-500 dark:text-blue-400 mt-1 flex items-center',
  friendSearchResultCardFriend:
    'text-sm text-green-500 dark:text-green-400 mt-1 flex items-center',
  friendSearchResultCardActions: 'flex items-center',
  friendNoResultsContainer:
    'bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center',
  friendNoResultsIcon:
    'inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-300 mb-4',
  friendNoResultsButton:
    'mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300',
};

export default GROUP_CLASSNAMES;
