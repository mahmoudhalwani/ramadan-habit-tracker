import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const AddHabitForm = ({ onAdd }) => {
    const [name, setName] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onAdd(name.trim());
            setName('');
            setIsOpen(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                className="btn-secondary"
                onClick={() => setIsOpen(true)}
                style={{ width: '100%', padding: '0.8rem', justifyContent: 'center' }}
                id="add-habit-btn"
            >
                <Plus size={16} />
                Add Custom Habit
            </button>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="glass-card"
            style={{
                padding: '1rem',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
            }}
        >
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Taraweeh, Dua, Reading..."
                className="input-field"
                style={{ flex: 1 }}
                autoFocus
                maxLength={30}
                id="custom-habit-input"
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1rem', whiteSpace: 'nowrap' }} id="save-habit-btn">
                Add
            </button>
            <button
                type="button"
                className="btn-secondary"
                onClick={() => { setIsOpen(false); setName(''); }}
                style={{ padding: '0.65rem 0.8rem' }}
            >
                Cancel
            </button>
        </form>
    );
};

export default AddHabitForm;
