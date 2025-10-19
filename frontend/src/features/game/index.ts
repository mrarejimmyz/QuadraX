/**
 * Game feature exports
 */

export { default as Board } from './Board';
export { default as GameInfo } from './GameInfo';
export { default as AIChat } from './AIChat';

// Refactored components
export { StatusBar } from './components/StatusBar';
export { MessageList } from './components/MessageList';
export { ChatInput } from './components/ChatInput';

// Refactored hooks
// useAgentManager removed - using pure ASI Alliance system
export { useAICommands } from './hooks/useAICommands';

// Types and utilities
export * from './types/chat.types';
export * from './utils/messageGenerators';
