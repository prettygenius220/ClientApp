import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTodos } from '../hooks/useTodos';
import { useFolders } from '../hooks/useFolders';
import { useTodoOrder } from '../hooks/useTodoOrder';
import { useBulkActions } from '../hooks/useBulkActions';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import TodoForm from '../components/todos/TodoForm';
import BulkActionsBar from '../components/todos/BulkActionsBar';
import TodoItem from '../components/todos/TodoItem';
import BulkSelectToggle from '../components/todos/BulkSelectToggle';
import TodoFilter from '../components/todos/TodoFilter';
import EditTodoModal from '../components/todos/EditTodoModal';
import EmptyState from '../components/todos/EmptyState';
import FolderList from '../components/folders/FolderList';
import CreateFolderModal from '../components/folders/CreateFolderModal';
import DeleteFolderModal from '../components/folders/DeleteFolderModal';
import EditFolderModal from '../components/folders/EditFolderModal';
import ShareFolderModal from '../components/folders/ShareFolderModal';
import UserList from '../components/UserList';
import { supabase } from '../lib/supabase';

export default function TodoList() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('todo_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        return;
      }

      setIsAdmin(data.role === 'admin');
    };

    checkAdminStatus();
  }, [user]);

  // Custom hooks for data management
  const { todos, setTodos, loading, addTodo, toggleTodo, deleteTodo, updateTodo } = useTodos();
  const { folders, createFolder, updateFolder, deleteFolder, shareFolder } = useFolders();
  const { todoOrder, setTodoOrder } = useTodoOrder();
  const {
    selectedTodos,
    setSelectedTodos,
    selectionMode,
    showBulkSelect,
    setShowBulkSelect,
    handleBulkMove,
    handleBulkDelete,
    handleBulkToggleComplete,
  } = useBulkActions(todos, setTodos);

  // Local state management
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingFolder, setDeletingFolder] = useState<Folder | null>(null);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [sharingFolder, setSharingFolder] = useState<Folder | null>(null);

  // Filter and sort todos
  const filteredTodos = todos
    .filter((todo) => selectedFolderId === null || todo.folder_id === selectedFolderId)
    .filter((todo) => {
      if (filter === 'active') return !todo.is_complete;
      if (filter === 'completed') return todo.is_complete;
      return true;
    })
    .sort((a, b) => {
      const folderId = selectedFolderId || 'root';
      const order = todoOrder[folderId] || [];
      const indexA = order.indexOf(a.id);
      const indexB = order.indexOf(b.id);
      
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

  // Drag and drop functionality
  const { handleDragStart, handleDragEnd, handleDrop } = useDragAndDrop(
    setTodoOrder,
    filteredTodos
  );

  // Loading state
  if (loading) {
    return (
      <div 
        className="flex justify-center items-center h-64"
        role="status"
        aria-label="Loading todos"
      >
        <div 
          className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
      {/* Folder sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-4">
        <FolderList
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelect={setSelectedFolderId}
          onCreateClick={() => setShowCreateModal(true)}
          onShareClick={setSharingFolder}
          onEditClick={setEditingFolder}
          onDeleteClick={setDeletingFolder}
        />

        {/* Show UserList for admins */}
        {isAdmin && <UserList />}
      </aside>

      {/* Main content area */}
      <div className="flex-grow min-w-0">
        {/* Header section */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {user?.email}
          </span>
        </div>

        {/* Controls section */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <TodoFilter filter={filter} onFilterChange={setFilter} />
            <BulkSelectToggle
              isEnabled={showBulkSelect}
              onToggle={(enabled) => {
                setShowBulkSelect(enabled);
                if (!enabled) {
                  setSelectedTodos(new Set());
                }
              }}
            />
          </div>
        </div>

        {/* Todo form */}
        <TodoForm 
          onSubmit={addTodo}
          folders={folders}
          selectedFolderId={selectedFolderId}
        />

        {/* Todo list */}
        <div className="space-y-4">
          {filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              isSelectable={showBulkSelect}
              isSelected={selectedTodos.has(todo.id)}
              onSelect={(todo) => {
                setSelectedTodos(prev => {
                  const newSelection = new Set(prev);
                  if (newSelection.has(todo.id)) {
                    newSelection.delete(todo.id);
                  } else {
                    newSelection.add(todo.id);
                  }
                  return newSelection;
                });
              }}
              todo={todo}
              onToggle={toggleTodo}
              onEdit={setEditingTodo}
              onDelete={deleteTodo}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
            />
          ))}
          
          {filteredTodos.length === 0 && <EmptyState filter={filter} />}
        </div>
      </div>

      {/* Modals */}
      {editingTodo && (
        <EditTodoModal
          todo={editingTodo}
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSave={updateTodo}
          onClose={() => setEditingTodo(null)}
        />
      )}

      {showCreateModal && (
        <CreateFolderModal
          onSubmit={createFolder}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editingFolder && (
        <EditFolderModal
          folder={editingFolder}
          onSubmit={updateFolder}
          onClose={() => setEditingFolder(null)}
        />
      )}

      {deletingFolder && (
        <DeleteFolderModal
          folder={deletingFolder}
          onConfirm={deleteFolder}
          onClose={() => setDeletingFolder(null)}
        />
      )}

      {sharingFolder && (
        <ShareFolderModal
          folder={sharingFolder}
          onShare={shareFolder}
          onClose={() => setSharingFolder(null)}
        />
      )}

      {/* Bulk actions bar */}
      {selectionMode && (
        <BulkActionsBar
          selectedCount={selectedTodos.size}
          todos={todos}
          selectedTodos={selectedTodos}
          folders={folders}
          onMoveToFolder={handleBulkMove}
          onDelete={handleBulkDelete}
          onToggleComplete={handleBulkToggleComplete}
          onClearSelection={() => setSelectedTodos(new Set())}
        />
      )}
    </div>
  );
}