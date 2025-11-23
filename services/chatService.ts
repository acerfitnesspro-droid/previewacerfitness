
import { supabase } from "../lib/supabase";
import { ChatMessage } from "../types";

export type ChatChannel = 'TRAINER' | 'NUTRITIONIST';

export const fetchMessages = async (userId: string, channel: ChatChannel): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .eq('channel', channel)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data.map((msg: any) => ({
    id: msg.id,
    userId: msg.user_id,
    channel: msg.channel,
    content: msg.content,
    isFromUser: msg.is_from_user,
    createdAt: msg.created_at
  }));
};

export const sendMessage = async (userId: string, channel: ChatChannel, content: string): Promise<ChatMessage | null> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      user_id: userId,
      channel: channel,
      content: content,
      is_from_user: true // Sempre true quando enviado pelo app do cliente
    })
    .select()
    .single();

  if (error) {
    console.error("Error sending message:", error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    channel: data.channel,
    content: data.content,
    isFromUser: data.is_from_user,
    createdAt: data.created_at
  };
};

export const subscribeToChat = (userId: string, channel: ChatChannel, onNewMessage: (msg: ChatMessage) => void) => {
  return supabase
    .channel(`chat:${userId}:${channel}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `user_id=eq.${userId}` // Filtra mensagens deste usuário
      },
      (payload) => {
        // Verifica se pertence ao canal atual
        if (payload.new.channel === channel) {
            const newMsg: ChatMessage = {
                id: payload.new.id,
                userId: payload.new.user_id,
                channel: payload.new.channel,
                content: payload.new.content,
                isFromUser: payload.new.is_from_user,
                createdAt: payload.new.created_at
            };
            onNewMessage(newMsg);
        }
      }
    )
    .subscribe();
};
