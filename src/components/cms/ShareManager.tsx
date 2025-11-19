import React, { useState } from 'react';
import { ShareStep1 } from './ShareStep1';
import { ShareStep2 } from './ShareStep2';
import { Contact } from '../../types/contacts';
import { loadCustomGroups } from '../../utils/custom-groups';

interface ShareManagerProps {
  onMenu: () => void;
}

export function ShareManager({ onMenu }: ShareManagerProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setStep(2);
  };

  const handleShareGroup = (groupId: string) => {
    // Find the group details
    const groups = loadCustomGroups();
    const group = groups.find(g => g.id === groupId);
    
    // Create a virtual contact representing the group
    const groupContact: Contact = {
      id: `group-${groupId}`,
      name: group?.label || groupId,
      title: 'Contact Group',
      avatar: '', // Will use default avatar
      group: groupId,
      createdAt: Date.now(),
      isGroupShare: true,
    };
    
    setSelectedContact(groupContact);
    setStep(2);
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setSelectedContact(undefined);
  };

  const handleAddContact = () => {
    // TODO: Implement add contact dialog
    console.log('Add contact clicked');
  };

  if (step === 1) {
    return (
      <ShareStep1
        onAddContact={handleAddContact}
        onSelectContact={handleSelectContact}
        onShareGroup={handleShareGroup}
      />
    );
  }

  return (
    <ShareStep2
      onBack={handleBackToStep1}
      onMenu={onMenu}
      selectedContact={selectedContact}
    />
  );
}