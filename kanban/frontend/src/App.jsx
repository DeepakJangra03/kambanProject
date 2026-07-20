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

            <header className="navbar flex justify-between items-center px-6 py-4 bg-transparent border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <span className="text-xl font-bold tracking-wide text-black">
                        Kanban Board
                    </span>
                    {activeBoardId && (
                        <button
                            onClick={() => setActiveBoardId(null)}
                            className="text-xs bg-black hover:bg-gray-800 px-3 py-1 rounded transition-colors text-white font-semibold"
                        >
                            ← Back to Boards
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowMemberModal(true)}
                        className="text-xs bg-black hover:bg-gray-800 px-3 py-1.5 rounded text-white text-white font-semibold transition-transform hover:scale-105"
                    >
                        + Add Member
                    </button>
                    <button
                        onClick={() => setShowTagModal(true)}
                        className="text-xs bg-white border border-gray-300 text-black hover:bg-gray-100 px-3 py-1.5 rounded font-semibold transition-transform hover:scale-105"
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
                        <h2 className="text-2xl font-semibold mb-6 text-black">Your Boards</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {boards.map(board => (
                                <div
                                    key={board.id}
                                    onClick={() => setActiveBoardId(board.id)}
                                    className="board-card bg-gray-50 hover:bg-gray-100 p-6 rounded-lg border border-gray-200 hover:border-gray-400 cursor-pointer transition-all shadow-md group"
                                >
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold group-hover:text-black transition-colors">
                                            {board.name}
                                        </h3>
                                        <button 
                                            onClick={(e) => handleDeleteBoard(e, board.id)}
                                            className="text-gray-400 hover:text-rose-500 transition-colors p-1"
                                            title="Delete Board"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2 h-12 overflow-hidden text-ellipsis line-clamp-2">
                                        {board.description || 'No description provided.'}
                                    </p>
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                                        <span>{board.lists_count || 0} lists</span>
                                        <span className="text-black group-hover:underline">Open Board →</span>
                                    </div>
                                </div>
                            ))}

                            <div
                                onClick={() => setShowBoardModal(true)}
                                className="board-card flex flex-col justify-center items-center p-6 rounded-lg border border-dashed border-gray-300 hover:border-purple-500 cursor-pointer hover:bg-gray-50/40 transition-all min-h-[160px]"
                            >
                                <span className="text-3xl text-gray-500">+</span>
                                <span className="text-sm font-semibold text-gray-600 mt-2">Create New Board</span>
                            </div>
                        </div>
                    </div>
                ) : (

                    boardDetails && (
                        <div className="h-full flex flex-col">

                            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-bold text-black">{boardDetails.name}</h2>
                                        <button 
                                            onClick={(e) => handleDeleteBoard(e, boardDetails.id)}
                                            className="text-xs text-rose-400 hover:text-white hover:bg-rose-500 transition-colors px-2 py-1 bg-rose-500/10 border border-rose-500/20 rounded"
                                            title="Delete Board"
                                        >
                                            Delete Board
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600 max-w-2xl mt-1">{boardDetails.description}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-2 overflow-hidden">
                                        {boardDetails.members && boardDetails.members.map(m => (
                                            <div
                                                key={m.id}
                                                title={`${m.name} (${m.email})`}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black text-white text-xs font-bold border-2 border-white shadow"
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
                                        className="text-xs bg-gray-50 text-black border border-gray-200 px-2 py-1.5 rounded"
                                    >
                                        <option value="">+ Invite Member</option>
                                        {members
                                            .filter(m => !boardDetails.members?.some(bm => bm.id === m.id))
                                            .map(m => (
                                                <option key={m.id} value={m.id}>{m.name}</option>
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
                                        className="kanban-column bg-gray-50 backdrop-blur w-72 shrink-0 p-4 rounded-lg border border-gray-200 flex flex-col max-h-[75vh]"
                                    >

                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-bold text-black text-sm tracking-wide uppercase">
                                                {list.name}
                                            </h4>
                                            <button
                                                onClick={() => handleDeleteList(list.id)}
                                                className="text-gray-500 hover:text-rose-400 text-xs transition-colors"
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
                                                    className="kanban-card bg-gray-50 hover:bg-gray-100 p-4 rounded border border-gray-200 hover:border-gray-400 cursor-grab active:cursor-grabbing transition-all shadow-sm relative group"
                                                >

                                                    <div className="flex flex-wrap gap-1 mb-2">
                                                        {card.tags && card.tags.map(t => (
                                                            <span
                                                                key={t.id}
                                                                className="text-[10px] px-2 py-0.5 rounded font-bold uppercase text-black tracking-wider"
                                                                style={{ backgroundColor: t.color }}
                                                            >
                                                                {t.name}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    <h5 className="font-semibold text-sm text-black mb-2">
                                                        {card.title}
                                                    </h5>

                                                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200/50 text-[11px] text-gray-600">

                                                        {card.due_date ? (
                                                            <span
                                                                className={`px-1.5 py-0.5 rounded font-semibold ${
                                                                    isOverdue(card.due_date)
                                                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                                                        : 'bg-slate-700 text-black'
                                                                }`}
                                                            >
                                                                📅 {formatDueDate(card.due_date)}
                                                                {isOverdue(card.due_date) && ' (Overdue)'}
                                                            </span>
                                                        ) : (
                                                            <span></span>
                                                        )}

                                                        {card.member ? (
                                                            <div
                                                                title={`Assigned to ${card.member.name}`}
                                                                className="w-5.5 h-5.5 rounded-full bg-black text-white flex items-center justify-center font-bold text-[10px]"
                                                            >
                                                                {card.member.name.charAt(0)}
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] text-gray-500 italic">Unassigned</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {list.cards?.length === 0 && (
                                                <div className="text-center text-xs text-gray-500 py-6 border border-dashed border-gray-200 rounded">
                                                    Drop cards here
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-gray-200/80">
                                            <input
                                                type="text"
                                                placeholder="+ Add card..."
                                                value={newCardTitles[list.id] || ''}
                                                onChange={(e) => setNewCardTitles({ ...newCardTitles, [list.id]: e.target.value })}
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateCard(list.id); }}
                                                className="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-xs text-black placeholder-slate-500 focus:outline-none focus:border-black"
                                            />
                                        </div>
                                    </div>
                                ))}

                                <div className="kanban-column bg-gray-50 w-72 shrink-0 p-4 rounded-lg border border-dashed border-gray-200 flex flex-col">
                                    <input
                                        type="text"
                                        placeholder="+ Add new list column..."
                                        value={newListNames[boardDetails.id] || ''}
                                        onChange={(e) => setNewListNames({ ...newListNames, [boardDetails.id]: e.target.value })}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleCreateList(boardDetails.id); }}
                                        className="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-xs text-black placeholder-slate-500 focus:outline-none focus:border-black"
                                    />
                                    <button
                                        onClick={() => handleCreateList(boardDetails.id)}
                                        className="text-xs bg-gray-50 hover:bg-slate-700 text-white font-semibold py-1.5 rounded mt-2 transition-colors"
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
                <div className="modal-backdrop fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="modal-content bg-white border border-gray-200 w-full max-w-md p-6 rounded-lg shadow-xl relative animate-fade-in">
                        <button
                            onClick={() => setShowBoardModal(false)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-black"
                        >
                            ✕
                        </button>
                        <h3 className="text-lg font-bold text-black mb-4">Create New Board</h3>
                        <form onSubmit={handleCreateBoard} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Board Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newBoard.name}
                                    onChange={(e) => setNewBoard({ ...newBoard, name: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-black focus:outline-none focus:border-black"
                                    placeholder="Engineering Sprint, Vacation Planner..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Description (Optional)</label>
                                <textarea
                                    value={newBoard.description}
                                    onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-black focus:outline-none focus:border-black h-24 resize-none"
                                    placeholder="Explain the purpose of this board..."
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 rounded text-sm transition-transform hover:scale-102"
                            >
                                Create Board
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showMemberModal && (
                <div className="modal-backdrop fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="modal-content bg-white border border-gray-200 w-full max-w-md p-6 rounded-lg shadow-xl relative">
                        <button
                            onClick={() => setShowMemberModal(false)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-black"
                        >
                            ✕
                        </button>
                        <h3 className="text-lg font-bold text-black mb-4">Add Global Member</h3>
                        <form onSubmit={handleCreateMember} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newMember.name}
                                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-black focus:outline-none focus:border-black"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={newMember.email}
                                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-black focus:outline-none focus:border-black"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 rounded text-sm transition-colors"
                            >
                                Add Member
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showTagModal && (
                <div className="modal-backdrop fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="modal-content bg-white border border-gray-200 w-full max-w-md p-6 rounded-lg shadow-xl relative">
                        <button
                            onClick={() => setShowTagModal(false)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-black"
                        >
                            ✕
                        </button>
                        <h3 className="text-lg font-bold text-black mb-4">Create Global Label Tag</h3>
                        <form onSubmit={handleCreateTag} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Tag Label Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newTag.name}
                                    onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-black focus:outline-none focus:border-black"
                                    placeholder="Bug, Design, Optimization..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Label Tag Color</label>
                                <div className="flex gap-3 items-center">
                                    <input
                                        type="color"
                                        value={newTag.color}
                                        onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                                        className="w-12 h-10 bg-transparent border-0 cursor-pointer"
                                    />
                                    <span className="text-xs text-gray-600 font-mono">{newTag.color}</span>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded text-sm transition-colors"
                            >
                                Add Label Tag
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {editingCard && (
                <div className="modal-backdrop fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="modal-content bg-white border border-gray-200 w-full max-w-xl p-6 rounded-lg shadow-xl relative animate-scale-up">
                        <button
                            onClick={() => setEditingCard(null)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-black"
                        >
                            ✕
                        </button>

                        <div className="mb-4">
                            <input
                                type="text"
                                className="w-full bg-transparent border-0 font-bold text-xl text-black focus:outline-none focus:bg-gray-50 px-2 py-1 rounded"
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
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Description</label>
                                    <textarea
                                        className="w-full bg-gray-50 border border-gray-200 rounded p-2.5 text-sm text-black focus:outline-none focus:border-black h-32 resize-none"
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

                            <div className="space-y-4 border-l border-gray-200/50 pl-0 md:pl-4">

                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Assignee</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 rounded text-xs px-2.5 py-1.5 text-black"
                                        value={editingCard.member_id || ''}
                                        onChange={(e) => {
                                            const val = e.target.value ? parseInt(e.target.value) : null;
                                            handleUpdateCardDetails(editingCard.id, { member_id: val });
                                        }}
                                    >
                                        <option value="">Unassigned</option>
                                        {boardDetails.members && boardDetails.members.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-gray-50 border border-gray-200 rounded text-xs px-2.5 py-1.5 text-black focus:outline-none"
                                        value={editingCard.due_date ? editingCard.due_date.substring(0, 10) : ''}
                                        onChange={(e) => {
                                            const val = e.target.value ? e.target.value + ' 12:00:00' : null;
                                            handleUpdateCardDetails(editingCard.id, { due_date: val });
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Labels/Tags</label>
                                    <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto border border-gray-200 p-2 rounded bg-gray-50/50">
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
                                                        className="rounded text-black focus:ring-purple-500 border-gray-200"
                                                    />
                                                    <span
                                                        className="px-2 py-0.5 rounded text-[10px] font-bold text-black uppercase tracking-wider block flex-1"
                                                        style={{ backgroundColor: tag.color }}
                                                    >
                                                        {tag.name}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200/50">
                                    <button
                                        onClick={() => handleDeleteCard(editingCard.id)}
                                        className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-1.5 rounded text-xs transition-colors"
                                    >
                                        Delete Card
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
