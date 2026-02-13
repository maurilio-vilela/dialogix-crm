import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, User, Info, MessageSquare, PlusCircle, Archive } from 'lucide-react';

// Mock Data (substituir com API real)
const conversations = [
  { id: 1, name: 'João da Silva', lastMessage: 'Olá, gostaria de um orçamento...', time: '10:45', unread: 2, status: 'open', channel: 'whatsapp' },
  { id: 2, name: 'Maria Oliveira', lastMessage: 'Qual o valor do produto X?', time: '10:42', unread: 0, status: 'open', channel: 'instagram' },
  { id: 3, name: 'Carlos Pereira', lastMessage: 'Obrigado!', time: 'Ontem', unread: 0, status: 'closed', channel: 'telegram' },
];

const messages = {
  1: [
    { id: 1, sender: 'João da Silva', text: 'Olá, gostaria de um orçamento...', time: '10:45', direction: 'inbound' },
    { id: 2, sender: 'Você', text: 'Claro, João! Do que você precisa?', time: '10:46', direction: 'outbound' },
  ],
  2: [
    { id: 1, sender: 'Maria Oliveira', text: 'Qual o valor do produto X?', time: '10:42', direction: 'inbound' },
  ]
};

// Componente principal
export function AttendancePage() {
  const [activeConversationId, setActiveConversationId] = useState(1);
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeMessages = messages[activeConversationId] || [];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background text-foreground">
      {/* Coluna 1: Lista de Conversas */}
      <aside className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Atendimento</h2>
          {/* TODO: Adicionar filtros */}
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(convo => (
            <div 
              key={convo.id}
              className={`p-4 border-b cursor-pointer ${activeConversationId === convo.id ? 'bg-muted' : 'hover:bg-muted/50'}`}
              onClick={() => setActiveConversationId(convo.id)}
            >
              <div className="flex justify-between">
                <h3 className="font-semibold">{convo.name}</h3>
                <span className="text-xs text-muted-foreground">{convo.time}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
              {convo.unread > 0 && (
                <div className="flex justify-end">
                  <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-1">{convo.unread}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Coluna 2: Chat Ativo */}
      <main className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <header className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{activeConversation.name}</h3>
                <span className="text-sm text-muted-foreground capitalize">{activeConversation.channel}</span>
              </div>
              {/* TODO: Ações da conversa */}
            </header>
            <div className="flex-1 p-4 overflow-y-auto bg-muted/20 space-y-4">
              {activeMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-lg p-3 max-w-lg ${msg.direction === 'outbound' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p>{msg.text}</p>
                    <span className="text-xs opacity-70 mt-1 block text-right">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <footer className="p-4 border-t">
              <div className="relative">
                <textarea 
                  className="w-full bg-muted border rounded-lg p-2 pr-10" 
                  placeholder="Digite sua mensagem..." 
                  rows={2}
                />
                {/* TODO: Adicionar botão de enviar */}
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mb-4" />
            <p>Selecione uma conversa para começar</p>
          </div>
        )}
      </main>

      {/* Coluna 3: Detalhes do Contato/Conversa */}
      <aside className="w-80 border-l flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Detalhes</h2>
        </div>
        {activeConversation ? (
          <div className="flex-1 p-4 space-y-4">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-2"></div>
              <h3 className="text-lg font-semibold">{activeConversation.name}</h3>
              <p className="text-sm text-muted-foreground">Status: {activeConversation.status}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Informações</h4>
              <p className="text-sm"><strong>Email:</strong> joao.silva@email.com</p>
              <p className="text-sm"><strong>Telefone:</strong> (11) 99999-9999</p>
            </div>
            {/* TODO: Adicionar mais detalhes, tags, etc. */}
          </div>
        ) : (
           <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <Info className="w-12 h-12 mb-4" />
            <p>Selecione uma conversa para ver os detalhes</p>
          </div>
        )}
      </aside>
    </div>
  );
}
