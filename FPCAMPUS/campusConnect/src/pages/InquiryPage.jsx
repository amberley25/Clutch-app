import { useEffect, useState } from 'react';

const InquiryPage = ({ id, onBack, isAdmin, currentUserId }) => {
	const [inquiry, setInquiry] = useState(null);
	const [messages, setMessages] = useState([]);
	const [reply, setReply] = useState('');

	useEffect(() => {
		const data = JSON.parse(localStorage.getItem('inquiries') || '[]');
		const found = data.find((item) => item.id === id);

		if (!found) {
			setInquiry(null);
			setMessages([]);
			return;
		}

		let hydratedMessages = Array.isArray(found.messages) ? found.messages : [];
		if (hydratedMessages.length === 0 && found.description) {
			hydratedMessages = [
				{
					id: found.id,
					from: 'user',
					text: found.description,
					time: found.created_at || new Date().toISOString(),
					readByUser: true,
					readByAdmin: true
				}
			];
			const updated = data.map((item) =>
				item.id === id ? { ...item, messages: hydratedMessages } : item
			);
			localStorage.setItem('inquiries', JSON.stringify(updated));
		}

		if (!isAdmin && currentUserId && found.user !== currentUserId) {
			setInquiry(null);
			setMessages([]);
			return;
		}

		setInquiry({ ...found, messages: hydratedMessages });
		setMessages(hydratedMessages);

		if (!isAdmin) {
			const marked = hydratedMessages.map((msg) =>
				msg.from === 'admin' ? { ...msg, readByUser: true } : msg
			);
			const updated = data.map((item) =>
				item.id === id ? { ...item, messages: marked } : item
			);
			localStorage.setItem('inquiries', JSON.stringify(updated));
			window.dispatchEvent(new CustomEvent('inquiriesUpdated'));
		}
	}, [id, isAdmin, currentUserId]);

	const saveMessages = (newMessages) => {
		const data = JSON.parse(localStorage.getItem('inquiries') || '[]');
		const updated = data.map((item) =>
			item.id === id ? { ...item, messages: newMessages } : item
		);
		localStorage.setItem('inquiries', JSON.stringify(updated));
		window.dispatchEvent(new CustomEvent('inquiriesUpdated'));
	};

	const sendReply = () => {
		const text = reply.trim();
		if (!text) return;

		const msg = {
			id: Date.now(),
			from: 'admin',
			text,
			time: new Date().toISOString(),
			readByUser: false,
			readByAdmin: true
		};

		const newMessages = [...messages, msg];
		setMessages(newMessages);
		setReply('');
		saveMessages(newMessages);
	};

	if (!inquiry) {
		return (
			<div className="inquiry-page">
				<div className="inquiry-header">
					<button className="btn-secondary" onClick={() => onBack('home')}>
						Back
					</button>
					<h2>Inquiry not found</h2>
				</div>
			</div>
		);
	}

	return (
		<div className="inquiry-page">
			<div className="inquiry-header">
				<button className="btn-secondary" onClick={() => onBack('home')}>
					Back
				</button>
				<div>
					<h2>{inquiry.problem || 'User message'}</h2>
						<div className="inquiry-meta">
							User Token ID: <span style={{fontFamily: 'monospace', fontWeight: 600}}>{inquiry.userToken || 'unknown'}</span>
						</div>
				</div>
			</div>

			<div className="inquiry-thread">
				{messages.map((msg) => (
					<div
						key={msg.id}
						className={`inquiry-message ${msg.from === 'admin' ? 'from-admin' : 'from-user'}`}
					>
						<div className="inquiry-message-text">{msg.text}</div>
						<div className="inquiry-message-time">
							{new Date(msg.time).toLocaleString()}
						</div>
					</div>
				))}
			</div>

			{isAdmin && (
				<div className="inquiry-reply">
					<textarea
						className="inquiry-reply-input"
						rows={4}
						placeholder="Write a reply to the user"
						value={reply}
						onChange={(e) => setReply(e.target.value)}
					/>
					<div className="inquiry-reply-actions">
						<button className="btn-primary" onClick={sendReply}>
							Send Reply
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default InquiryPage;
