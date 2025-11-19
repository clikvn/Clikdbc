import { Contact, ContactGroup } from '../types/contacts';

const STORAGE_KEY = 'contacts';

// Migration mapping from old groups to new groups
const GROUP_MIGRATION_MAP: Record<string, ContactGroup> = {
  'high-potential': 'business',
  'business-partner': 'business',
  'low-potential': 'personal',
};

// Migrate old contact groups to new groups
function migrateContactGroups(contacts: Contact[]): Contact[] {
  return contacts.map(contact => {
    const oldGroup = contact.group as string;
    if (GROUP_MIGRATION_MAP[oldGroup]) {
      return {
        ...contact,
        group: GROUP_MIGRATION_MAP[oldGroup]
      };
    }
    return contact;
  });
}

export function loadContacts(): Contact[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const contacts = JSON.parse(stored);
      // Migrate old groups to new groups
      const migratedContacts = migrateContactGroups(contacts);
      // Save migrated data back
      if (JSON.stringify(contacts) !== JSON.stringify(migratedContacts)) {
        saveContacts(migratedContacts);
      }
      return migratedContacts;
    }
  } catch (error) {
    console.error('Failed to load contacts:', error);
  }
  return getDefaultContacts();
}

export function saveContacts(contacts: Contact[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  } catch (error) {
    console.error('Failed to save contacts:', error);
  }
}

export function addContact(contact: Omit<Contact, 'id' | 'createdAt'>): Contact {
  const contacts = loadContacts();
  const newContact: Contact = {
    ...contact,
    id: Date.now().toString(),
    createdAt: Date.now()
  };
  contacts.push(newContact);
  saveContacts(contacts);
  return newContact;
}

export function deleteContact(id: string): void {
  const contacts = loadContacts();
  const filtered = contacts.filter(c => c.id !== id);
  saveContacts(filtered);
}

export function updateContact(id: string, updates: Partial<Contact>): void {
  const contacts = loadContacts();
  const index = contacts.findIndex(c => c.id === id);
  if (index !== -1) {
    contacts[index] = { ...contacts[index], ...updates };
    saveContacts(contacts);
  }
}

export function getContactsByGroup(group: ContactGroup): Contact[] {
  const contacts = loadContacts();
  return contacts.filter(c => c.group === group);
}

export function getContactGroupCounts(): Record<ContactGroup, number> {
  const contacts = loadContacts();
  return {
    'public': contacts.filter(c => c.group === 'public').length,
    'private': contacts.filter(c => c.group === 'private').length,
    'business': contacts.filter(c => c.group === 'business').length,
    'personal': contacts.filter(c => c.group === 'personal').length
  };
}

function getDefaultContacts(): Contact[] {
  return [
    {
      id: '1',
      name: 'Mira',
      title: 'Trưởng BP Kinh Doanh Vinaseal',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      group: 'business',
      email: 'mira@example.com',
      phone: '+84123456789',
      createdAt: Date.now() - 86400000 * 5
    },
    {
      id: '2',
      name: 'Lory',
      title: 'Trưởng BP Kinh Doanh Vinaseal',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      group: 'business',
      email: 'lory@example.com',
      phone: '+84123456790',
      createdAt: Date.now() - 86400000 * 4
    },
    {
      id: '3',
      name: 'Sophie',
      title: 'Trưởng BP Kinh Doanh Vinaseal',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      group: 'public',
      email: 'sophie@example.com',
      phone: '+84123456791',
      createdAt: Date.now() - 86400000 * 3
    },
    {
      id: '4',
      name: 'Jade',
      title: 'Trưởng BP Kinh Doanh Vinaseal',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
      group: 'business',
      email: 'jade@example.com',
      phone: '+84123456792',
      createdAt: Date.now() - 86400000 * 2
    },
    {
      id: '5',
      name: 'Nina',
      title: 'Trưởng BP Kinh Doanh Vinaseal',
      avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
      group: 'personal',
      email: 'nina@example.com',
      phone: '+84123456793',
      createdAt: Date.now() - 86400000
    }
  ];
}