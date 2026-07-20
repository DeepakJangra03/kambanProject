import React, { useState, useEffect } from 'react';
import { apiFetch } from "./lib/api";
export default function App() {
    const [boards, setBoards] = useState([]);
    const [activeBoardId, setActiveBoardId] = useState(null);
    const [boardDetails, setBoardDetails] = useState(null);
    const [members, setMembers] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);

    const [editingCard, setEditingCard] = useState(null);
    const [showBoardModal, setShowBoardModal] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [showTagModal, setShowTagModal] = useState(false);

    const [newBoard, setNewBoard] = useState({ name: '', description: '' });
    const [newMember, setNewMember] = useState({ name: '', email: '' });
    const [newTag, setNewTag] = useState({ name: '', color: '#3b82f6' });
    const [newListNames, setNewListNames] = useState({}); 
    const [newCardTitles, setNewCardTitles] = useState({}); 

    const [draggedCardId, setDraggedCardId] = useState(null);

    useEffect(() => {
        fetchBoards();
        fetchMembers();
        fetchTags();
    }, []);

    useEffect(() => {
        if (activeBoardId) {
            fetchBoardDetails(activeBoardId);
        } else {
            setBoardDetails(null);
        }
    }, [activeBoardId]);

    const fetchBoards = async () => {
        try {
            const res = await apiFetch('/api/boards');
            const data = await res.json();
            setBoards(data);
        } catch (e) {
            console.error('Error fetching boards:', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchBoardDetails = async (id) => {
        try {
            const res = await apiFetch(`/api/boards/${id}`);
            const data = await res.json();
            setBoardDetails(data);
        } catch (e) {
            console.error('Error fetching board details:', e);
        }
    };

    const fetchMembers = async () => {
        try {
            const res = await apiFetch('/api/members');
            const data = await res.json();
            setMembers(data);
        } catch (e) {
            console.error('Error fetching members:', e);
        }
    };

    const fetchTags = async () => {
        try {
            const res = await apiFetch('/api/tags');
            const data = await res.json();
            setTags(data);
        } catch (e) {
            console.error('Error fetching tags:', e);
        }
    };

    const handleCreateBoard = async (e) => {
        e.preventDefault();
        if (!newBoard.name.trim()) return;
        try {
            const res = await apiFetch('/api/boards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBoard)
            });
            const data = await res.json();
            setBoards([...boards, { ...data, lists_count: 3 }]);
            setActiveBoardId(data.id);
            setNewBoard({ name: '', description: '' });
            setShowBoardModal(false);
        } catch (e) {
            console.error('Error creating board:', e);
        }
    };

    const handleDeleteBoard = async (e, boardId) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this board? All lists and cards will be permanently deleted.')) return;
        try {
            await apiFetch(`/api/boards/${boardId}`, { method: 'DELETE' });
            setBoards(boards.filter(b => b.id !== boardId));
            if (activeBoardId === boardId) {
                setActiveBoardId(null);
            }
        } catch (e) {
            console.error('Error deleting board:', e);
        }
    };

    const handleAddBoardMember = async (memberId) => {
        if (!boardDetails) return;
        try {
            const res = await apiFetch(`/api/boards/${boardDetails.id}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ member_id: memberId })
            });
            const data = await res.json();
            setBoardDetails(data);
        } catch (e) {
            console.error('Error adding member:', e);
        }
    };

    const handleCreateList = async (boardId) => {
        const name = newListNames[boardId];
        if (!name || !name.trim()) return;
        try {
            const res = await apiFetch('/api/lists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ board_id: boardId, name })
            });
            const data = await res.json();
            setBoardDetails({
                ...boardDetails,
                lists: [...boardDetails.lists, data]
            });
            setNewListNames({ ...newListNames, [boardId]: '' });
        } catch (e) {
            console.error('Error creating list:', e);
        }
    };

    const handleDeleteList = async (listId) => {
        if (!confirm('Are you sure you want to delete this list? All cards in it will be lost.')) return;
        try {
            await apiFetch(`/api/lists/${listId}`, { method: 'DELETE' });
            setBoardDetails({
                ...boardDetails,
                lists: boardDetails.lists.filter(l => l.id !== listId)
            });
        } catch (e) {
            console.error('Error deleting list:', e);
        }
    };

    const handleCreateCard = async (listId) => {
        const title = newCardTitles[listId];
        if (!title || !title.trim()) return;
        try {
            const res = await apiFetch('/api/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ board_list_id: listId, title })
            });
            const data = await res.json();

            const updatedLists = boardDetails.lists.map(list => {
                if (list.id === listId) {
                    return { ...list, cards: [...list.cards, data] };
                }
                return list;
            });
            setBoardDetails({ ...boardDetails, lists: updatedLists });
            setNewCardTitles({ ...newCardTitles, [listId]: '' });
        } catch (e) {
            console.error('Error creating card:', e);
        }
    };

    const handleUpdateCardDetails = async (cardId, fields) => {
        try {
            const res = await apiFetch(`/api/cards/${cardId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fields)
            });
            const data = await res.json();

            fetchBoardDetails(boardDetails.id);
            setEditingCard(data);
        } catch (e) {
            console.error('Error updating card:', e);
        }
    };

    const handleDeleteCard = async (cardId) => {

        if (!confirm('Delete this card?')) return;
        try {
            await apiFetch(`/api/cards/${cardId}`, { method: 'DELETE' });
            setBoardDetails({
                ...boardDetails,
                lists: boardDetails.lists.map(l => ({
                    ...l,
                    cards: l.cards.filter(c => c.id !== cardId)
                }))
            });
            setEditingCard(null);
        } catch (e) {
            console.error('Error deleting card:', e);
        }
    };

    const handleCreateMember = async (e) => {
        e.preventDefault();
        if (!newMember.name.trim() || !newMember.email.trim()) return;
        try {
            const res = await apiFetch('/api/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMember)
            });
            const data = await res.json();
            setMembers([...members, data]);
            setNewMember({ name: '', email: '' });
            setShowMemberModal(false);
        } catch (e) {
            console.error('Error creating member:', e);
        }
    };

    const handleCreateTag = async (e) => {
        e.preventDefault();
        if (!newTag.name.trim()) return;
        try {
            const res = await apiFetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTag)
            });
            const data = await res.json();
            setTags([...tags, data]);
            setNewTag({ name: '', color: '#3b82f6' });
            setShowTagModal(false);
        } catch (e) {
            console.error('Error creating tag:', e);
        }
    };

    const handleDragStart = (e, cardId) => {
        setDraggedCardId(cardId);
        e.dataTransfer.setData('text/plain', cardId.toString());
        e.currentTarget.classList.add('dragging');
    };

    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove('dragging');
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e, targetListId) => {
        e.preventDefault();
        const cardId = parseInt(e.dataTransfer.getData('text/plain') || draggedCardId);
        if (!cardId) return;

        let foundCard = null;
        const currentLists = [...boardDetails.lists];

        const updatedLists = currentLists.map(list => {
            const cardIndex = list.cards.findIndex(c => c.id === cardId);
            if (cardIndex !== -1) {
                foundCard = { ...list.cards[cardIndex], board_list_id: targetListId };
                const newCards = [...list.cards];
                newCards.splice(cardIndex, 1);
                return { ...list, cards: newCards };
            }
            return list;
        });

        if (!foundCard) return;

        const finalLists = updatedLists.map(list => {
            if (list.id === targetListId) {
                const newCards = [...list.cards, foundCard];
                return { ...list, cards: newCards };
            }
            return list;
        });

        setBoardDetails({ ...boardDetails, lists: finalLists });

        const targetList = finalLists.find(l => l.id === targetListId);
        const newOrder = targetList ? targetList.cards.length - 1 : 0;

        try {
            await apiFetch('/api/cards/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    card_id: cardId,
                    board_list_id: targetListId,
                    order: newOrder
                })
            });

            fetchBoardDetails(boardDetails.id);
        } catch (e) {
            console.error('Error saving reorder state:', e);
        }

        setDraggedCardId(null);
    };

    const isOverdue = (dateStr) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const now = new Date();
        return date < now;
    };

    const formatDueDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex flex-col min-h-screen">

            <header className="navbar flex justify-between items-center px-6 py-4 bg-transparent border-b">
                <div className="flex items-center gap-4">
                    <span className="text-xl font-bold tracking-wide text-white drop-shadow-lg">
                        ✨ Kanban Board
                    </span>
                    {activeBoardId && (
                        <button
                            onClick={() => setActiveBoardId(null)}
                            className="text-xs px-4 py-2 rounded-xl transition-all text-white font-semibold backdrop-blur-sm"
                            style={{background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.2)'}}
                        >
                            ← Back to Boards
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowMemberModal(true)}
                        className="text-xs px-4 py-2 rounded-xl text-white font-semibold transition-all backdrop-blur-sm"
                        style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'}}
                    >
                        + Add Member
                    </button>
                    <button
                        onClick={() => setShowTagModal(true)}
                        className="text-xs px-4 py-2 rounded-xl font-semibold text-white transition-all backdrop-blur-sm"
                        style={{background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.25)'}}
                    >
                        + Add Tag
                    </button>
                </div>
            </header>

            <main className="flex-1 p-6 overflow-x-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
                    </div>
                ) : !activeBoardId ? (

                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl font-bold mb-8 text-white drop-shadow-lg">🎯 Your Boards</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {boards.map(board => (
                                <div
                                    key={board.id}
                                    onClick={() => setActiveBoardId(board.id)}
                                    className="board-card p-6 rounded-lg cursor-pointer transition-all group relative z-10"
                                >
                                    <div className="flex justify-between items-start relative z-10">
                                        <h3 className="text-lg font-bold text-white group-hover:drop-shadow-lg transition-all">
                                            {board.name}
                                        </h3>
                                        <button 
                                            onClick={(e) => handleDeleteBoard(e, board.id)}
                                            className="text-white/60 hover:text-red-400 transition-colors p-1"
                                            title="Delete Board"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <p className="text-sm text-white/70 mt-3 h-12 overflow-hidden">
                                        {board.description || 'No description provided.'}
                                    </p>
                                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/20 text-xs text-white/60">
                                        <span>📋 {board.lists_count || 0} lists</span>
                                        <span className="text-white font-semibold group-hover:underline">Open →</span>
                                    </div>
                                </div>
                            ))}

                            <div
                                onClick={() => setShowBoardModal(true)}
                                className="board-card flex flex-col justify-center items-center p-6 rounded-lg cursor-pointer transition-all min-h-[180px] relative z-10"
                                style={{borderStyle: 'dashed'}}
                            >
                                <span className="text-5xl text-white/50 mb-3">+</span>
                                <span className="text-sm font-semibold text-white/80">Create New Board</span>
                            </div>
                        </div>
                    </div>
                ) : (

                    boardDetails && (
                        <div className="h-full flex flex-col">

                            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-3xl font-bold text-white drop-shadow-lg">{boardDetails.name}</h2>
                                        <button 
                                            onClick={(e) => handleDeleteBoard(e, boardDetails.id)}
                                            className="text-xs text-white hover:bg-rose-500 transition-all px-3 py-1.5 rounded-xl backdrop-blur-sm"
                                            style={{background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)'}}
                                            title="Delete Board"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                    <p className="text-sm text-white/70 max-w-2xl mt-2">{boardDetails.description}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-2">
                                        {boardDetails.members && boardDetails.members.map(m => (
                                            <div
                                                key={m.id}
                                                title={`${m.name} (${m.email})`}
                                                className="inline-flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-bold border-2 shadow-lg"
                                                style={{background: 'linear-gradient(135deg, #667eea, #764ba2)', borderColor: 'rgba(255, 255, 255, 0.3)'}}
                                            >
                                                {m.name.charAt(0)}
                                            </div>
                                        ))}
                                    </div>
                                    <select
                                        onChange={(e) => {
                                            if (e.target.value) handleAddBoardMember(e.target.value);
                                            e.target.value = '';
                                        }}
                                        className="text-xs px-3 py-2 rounded-xl backdrop-blur-sm text-white font-medium"
                                        style={{background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)'}}
                                    >
                                        <option value="" className="text-gray-900">+ Invite Member</option>
                                        {members
                                            .filter(m => !boardDetails.members?.some(bm => bm.id === m.id))
                                            .map(m => (
                                                <option key={m.id} value={m.id} className="text-gray-900">{m.name}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-6 items-start">
                                {boardDetails.lists && boardDetails.lists.map(list => (
                                    <div
                                        key={list.id}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, list.id)}
                                        className="kanban-column backdrop-blur w-72 shrink-0 p-4 rounded-lg flex flex-col max-h-[75vh]"
                                    >

                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-white text-sm tracking-wider uppercase drop-shadow-md">
                                                {list.name}
                                            </h4>
                                            <button
                                                onClick={() => handleDeleteList(list.id)}
                                                className="text-white/50 hover:text-red-400 text-sm transition-colors"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[50vh]">
                                            {list.cards && list.cards.map(card => (
                                                <div
                                                    key={card.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, card.id)}
                                                    onDragEnd={handleDragEnd}
                                                    onClick={() => setEditingCard(card)}
                                                    className="kanban-card p-4 rounded cursor-grab active:cursor-grabbing transition-all relative group"
                                                >

                                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                                        {card.tags && card.tags.map(t => (
                                                            <span
                                                                key={t.id}
                                                                className="glass-tag text-[10px] px-2.5 py-1 rounded-full font-bold uppercase text-white tracking-wider"
                                                                style={{ backgroundColor: t.color }}
                                                            >
                                                                {t.name}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    <h5 className="font-semibold text-sm text-white mb-3">
                                                        {card.title}
                                                    </h5>

                                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10 text-[11px]">

                                                        {card.due_date ? (
                                                            <span
                                                                className={`px-2 py-1 rounded-lg font-semibold backdrop-blur-sm ${
                                                                    isOverdue(card.due_date)
                                                                        ? 'text-rose-300'
                                                                        : 'text-white/80'
                                                                }`}
                                                                style={{
                                                                    background: isOverdue(card.due_date) 
                                                                        ? 'rgba(239, 68, 68, 0.2)' 
                                                                        : 'rgba(255, 255, 255, 0.1)',
                                                                    border: `1px solid ${isOverdue(card.due_date) ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`
                                                                }}
                                                            >
                                                                📅 {formatDueDate(card.due_date)}
                                                                {isOverdue(card.due_date) && ' ⚠️'}
                                                            </span>
                                                        ) : (
                                                            <span></span>
                                                        )}

                                                        {card.member ? (
                                                            <div
                                                                title={`Assigned to ${card.member.name}`}
                                                                className="w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-[10px] shadow-md"
                                                                style={{background: 'linear-gradient(135deg, #667eea, #764ba2)'}}
                                                            >
                                                                {card.member.name.charAt(0)}
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] text-white/40 italic">Unassigned</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {list.cards?.length === 0 && (
                                                <div className="text-center text-xs text-white/40 py-8 border border-dashed border-white/20 rounded-xl backdrop-blur-sm">
                                                    Drop cards here
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-white/10">
                                            <input
                                                type="text"
                                                placeholder="+ Add card..."
                                                value={newCardTitles[list.id] || ''}
                                                onChange={(e) => setNewCardTitles({ ...newCardTitles, [list.id]: e.target.value })}
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateCard(list.id); }}
                                                className="w-full rounded-xl px-3 py-2 text-xs text-white font-medium"
                                            />
                                        </div>
                                    </div>
                                ))}

                                <div className="kanban-column w-72 shrink-0 p-4 rounded-lg flex flex-col" style={{borderStyle: 'dashed'}}>
                                    <input
                                        type="text"
                                        placeholder="+ Add new list column..."
                                        value={newListNames[boardDetails.id] || ''}
                                        onChange={(e) => setNewListNames({ ...newListNames, [boardDetails.id]: e.target.value })}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleCreateList(boardDetails.id); }}
                                        className="w-full rounded-xl px-3 py-2 text-xs text-white font-medium mb-2"
                                    />
                                    <button
                                        onClick={() => handleCreateList(boardDetails.id)}
                                        className="text-xs text-white font-semibold py-2 rounded-xl transition-all backdrop-blur-sm"
                                        style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}
                                    >
                                        Create List
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </main>

            {showBoardModal && (
                <div className="modal-backdrop fixed inset-0 flex justify-center items-center z-50">
                    <div className="modal-content w-full max-w-md p-8 rounded-lg relative">
                        <button
                            onClick={() => setShowBoardModal(false)}
                            className="absolute top-4 right-4 text-white/70 hover:text-white text-xl"
                        >
                            ✕
                        </button>
                        <h3 className="text-2xl font-bold text-white mb-6 drop-shadow-lg">✨ Create New Board</h3>
                        <form onSubmit={handleCreateBoard} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-white/80 uppercase mb-2">Board Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newBoard.name}
                                    onChange={(e) => setNewBoard({ ...newBoard, name: e.target.value })}
                                    className="w-full rounded-xl px-4 py-3 text-sm text-white font-medium"
                                    placeholder="Engineering Sprint, Vacation Planner..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-white/80 uppercase mb-2">Description (Optional)</label>
                                <textarea
                                    value={newBoard.description}
                                    onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
                                    className="w-full rounded-xl px-4 py-3 text-sm text-white font-medium h-24 resize-none"
                                    placeholder="What is this board for?"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all shadow-lg"
                                style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
                            >
                                Create Board
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showMemberModal && (
                <div className="modal-backdrop fixed inset-0 flex justify-center items-center z-50">
                    <div className="modal-content w-full max-w-md p-8 rounded-lg relative">
                        <button
                            onClick={() => setShowMemberModal(false)}
                            className="absolute top-4 right-4 text-white/70 hover:text-white text-xl"
                        >
                            ✕
                        </button>
                        <h3 className="text-2xl font-bold text-white mb-6 drop-shadow-lg">👤 Add Global Member</h3>
                        <form onSubmit={handleCreateMember} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-white/80 uppercase mb-2">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newMember.name}
                                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                    className="w-full rounded-xl px-4 py-3 text-sm text-white font-medium"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-white/80 uppercase mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={newMember.email}
                                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                    className="w-full rounded-xl px-4 py-3 text-sm text-white font-medium"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all shadow-lg"
                                style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
                            >
                                Add Member
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showTagModal && (
                <div className="modal-backdrop fixed inset-0 flex justify-center items-center z-50">
                    <div className="modal-content w-full max-w-md p-8 rounded-lg relative">
                        <button
                            onClick={() => setShowTagModal(false)}
                            className="absolute top-4 right-4 text-white/70 hover:text-white text-xl"
                        >
                            ✕
                        </button>
                        <h3 className="text-2xl font-bold text-white mb-6 drop-shadow-lg">🏷️ Create Global Tag</h3>
                        <form onSubmit={handleCreateTag} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-white/80 uppercase mb-2">Tag Label Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newTag.name}
                                    onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                                    className="w-full rounded-xl px-4 py-3 text-sm text-white font-medium"
                                    placeholder="Bug, Design, Optimization..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-white/80 uppercase mb-2">Label Tag Color</label>
                                <div className="flex gap-3 items-center">
                                    <input
                                        type="color"
                                        value={newTag.color}
                                        onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                                        className="w-14 h-12 rounded-xl cursor-pointer border-2 border-white/20"
                                    />
                                    <span className="text-sm text-white/80 font-mono backdrop-blur-sm px-3 py-2 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.1)'}}>{newTag.color}</span>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all shadow-lg"
                                style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}
                            >
                                Add Label Tag
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {editingCard && (
                <div className="modal-backdrop fixed inset-0 flex justify-center items-center z-50">
                    <div className="modal-content w-full max-w-2xl p-8 rounded-lg relative">
                        <button
                            onClick={() => setEditingCard(null)}
                            className="absolute top-4 right-4 text-white/70 hover:text-white text-xl"
                        >
                            ✕
                        </button>

                        <div className="mb-6">
                            <input
                                type="text"
                                className="w-full bg-transparent border-0 font-bold text-2xl text-white focus:outline-none px-2 py-1 rounded-lg placeholder-white/40"
                                style={{background: 'rgba(255, 255, 255, 0.08)'}}
                                defaultValue={editingCard.title}
                                onBlur={(e) => {
                                    if (e.target.value.trim() && e.target.value !== editingCard.title) {
                                        handleUpdateCardDetails(editingCard.id, { title: e.target.value });
                                    }
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            <div className="md:col-span-2 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-white/80 uppercase mb-2">Description</label>
                                    <textarea
                                        className="w-full rounded-xl p-4 text-sm text-white font-medium h-36 resize-none"
                                        placeholder="Add a detailed description..."
                                        defaultValue={editingCard.description || ''}
                                        onBlur={(e) => {
                                            if (e.target.value !== (editingCard.description || '')) {
                                                handleUpdateCardDetails(editingCard.id, { description: e.target.value });
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 border-l border-white/10 pl-0 md:pl-6">

                                <div>
                                    <label className="block text-[11px] font-semibold text-white/70 uppercase mb-2">👤 Assignee</label>
                                    <select
                                        className="w-full rounded-xl text-sm px-3 py-2 text-white font-medium"
                                        value={editingCard.member_id || ''}
                                        onChange={(e) => {
                                            const val = e.target.value ? parseInt(e.target.value) : null;
                                            handleUpdateCardDetails(editingCard.id, { member_id: val });
                                        }}
                                    >
                                        <option value="" className="text-gray-900">Unassigned</option>
                                        {boardDetails.members && boardDetails.members.map(m => (
                                            <option key={m.id} value={m.id} className="text-gray-900">{m.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-white/70 uppercase mb-2">📅 Due Date</label>
                                    <input
                                        type="date"
                                        className="w-full rounded-xl text-sm px-3 py-2 text-white font-medium"
                                        value={editingCard.due_date ? editingCard.due_date.substring(0, 10) : ''}
                                        onChange={(e) => {
                                            const val = e.target.value ? e.target.value + ' 12:00:00' : null;
                                            handleUpdateCardDetails(editingCard.id, { due_date: val });
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-white/70 uppercase mb-2">🏷️ Labels/Tags</label>
                                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto p-3 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.08)'}}>
                                        {tags.map(tag => {
                                            const isAttached = editingCard.tags?.some(t => t.id === tag.id);
                                            return (
                                                <label key={tag.id} className="flex items-center gap-2 cursor-pointer text-xs">
                                                    <input
                                                        type="checkbox"
                                                        checked={isAttached}
                                                        onChange={() => {
                                                            const currentTagIds = editingCard.tags?.map(t => t.id) || [];
                                                            let newTagIds;
                                                            if (isAttached) {
                                                                newTagIds = currentTagIds.filter(id => id !== tag.id);
                                                            } else {
                                                                newTagIds = [...currentTagIds, tag.id];
                                                            }
                                                            handleUpdateCardDetails(editingCard.id, { tags: newTagIds });
                                                        }}
                                                        className="rounded text-purple-500 focus:ring-purple-500"
                                                    />
                                                    <span
                                                        className="glass-tag px-2.5 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider block flex-1"
                                                        style={{ backgroundColor: tag.color }}
                                                    >
                                                        {tag.name}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <button
                                        onClick={() => handleDeleteCard(editingCard.id)}
                                        className="w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-all backdrop-blur-sm"
                                        style={{background: 'rgba(239, 68, 68, 0.3)', border: '1px solid rgba(239, 68, 68, 0.4)'}}
                                    >
                                        🗑️ Delete Card
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
