const CHANNEL_ORDER = ['email', 'telegram', 'whatsapp'];

const ALIASES = {
  ambos: ['email', 'telegram'],
  all: ['email', 'telegram', 'whatsapp'],
  todos: ['email', 'telegram', 'whatsapp'],
};

const LABELS = {
  email: 'Correo electrónico',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
};

function normalizeChannels(channels = []) {
  const normalized = new Set();
  channels.forEach((channel) => {
    if (!channel) return;
    normalized.add(channel.toLowerCase());
  });

  if (!normalized.size) {
    normalized.add('email');
  }

  const ordered = [];
  CHANNEL_ORDER.forEach((channel) => {
    if (normalized.has(channel)) ordered.push(channel);
  });

  normalized.forEach((channel) => {
    if (!CHANNEL_ORDER.includes(channel)) ordered.push(channel);
  });

  return ordered;
}

export function getChannelsFromPreference(preference) {
  if (!preference) return ['email'];

  const key = preference.toLowerCase();
  if (ALIASES[key]) {
    return [...ALIASES[key]];
  }

  return normalizeChannels(
    preference
      .split('+')
      .map((channel) => channel.trim())
      .filter(Boolean)
  );
}

export function wantsChannel(preference, channel) {
  return getChannelsFromPreference(preference).includes(channel);
}

export function addChannelToPreference(preference, channel) {
  const channels = new Set(getChannelsFromPreference(preference));
  channels.add(channel.toLowerCase());
  return normalizeChannels([...channels]).join('+');
}

export function removeChannelFromPreference(preference, channel, fallback = ['email']) {
  const channels = new Set(getChannelsFromPreference(preference));
  channels.delete(channel.toLowerCase());

  if (!channels.size) {
    fallback.forEach((item) => channels.add(item));
  }

  return normalizeChannels([...channels]).join('+');
}

export function setNotificationPreferenceFromChannels(channels = []) {
  return normalizeChannels(channels).join('+');
}

export function formatPreferenceLabel(preference) {
  const channels = getChannelsFromPreference(preference);
  return channels
    .map((channel) => LABELS[channel] || channel)
    .join(' + ');
}
