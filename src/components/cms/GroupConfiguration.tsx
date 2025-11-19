import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { loadCustomGroups, createGroup, updateGroup, deleteGroup, CustomGroup, getColorClasses } from "../../utils/custom-groups";
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { GroupDialog } from "./GroupDialog";
import { loadGroupShareSettings } from "../../utils/group-share-settings";
import { loadBusinessCardData } from "../../utils/storage";
import { toast } from "sonner@2.0.3";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

export function GroupConfiguration() {
  const [groups, setGroups] = useState<CustomGroup[]>(loadCustomGroups());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CustomGroup | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<CustomGroup | undefined>();
  const settings = loadGroupShareSettings();
  const businessCardData = loadBusinessCardData();
  const userCode = businessCardData.userCode || 'user';

  const getShareUrl = (groupId: string): string => {
    const baseUrl = window.location.origin;
    const group = groups.find(g => g.id === groupId);
    const shareCode = group?.shareCode || groupId;
    return `${baseUrl}/${userCode}/${shareCode}`;
  };

  const refreshGroups = () => {
    setGroups(loadCustomGroups());
  };

  const handleCreate = () => {
    setEditingGroup(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (group: CustomGroup) => {
    setEditingGroup(group);
    setDialogOpen(true);
  };

  const handleSave = (label: string, description: string, icon: string, color: string, shareCode: string) => {
    if (editingGroup) {
      // Update existing group
      updateGroup(editingGroup.id, { label, description, icon, color, shareCode });
      toast.success("Group updated successfully");
    } else {
      // Create new group
      createGroup(label, description, icon, color, shareCode);
      toast.success("Group created successfully");
    }
    refreshGroups();
    setEditingGroup(undefined);
  };

  const handleDeleteClick = (group: CustomGroup) => {
    if (group.isDefault) {
      toast.error("Default groups cannot be deleted");
      return;
    }
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (groupToDelete) {
      deleteGroup(groupToDelete.id);
      toast.success("Group deleted successfully");
      refreshGroups();
      setGroupToDelete(undefined);
    }
  };

  const handleDeleteFromDialog = () => {
    if (editingGroup && !editingGroup.isDefault) {
      deleteGroup(editingGroup.id);
      toast.success("Group deleted successfully");
      refreshGroups();
      setEditingGroup(undefined);
      setDialogOpen(false);
    }
  };

  const getVisibleCount = (groupId: string): number => {
    return settings[groupId]?.length || 0;
  };

  const renderIcon = (iconName: string, className: string = "w-5 h-5") => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className={className} /> : null;
  };

  return (
    <>
      <div className="space-y-4">
        {/* Add Group Button */}
        <div className="flex justify-end">
          <Button onClick={handleCreate} size="sm" className="shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Add Group
          </Button>
        </div>

        {/* Groups List */}
        <div className="space-y-2">
          {groups.map((group) => {
            const colorClasses = getColorClasses(group.color);
            const visibleCount = getVisibleCount(group.id);
            
            return (
              <div
                key={group.id}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 ${colorClasses.bg} ${colorClasses.border} transition-all`}
              >
                {/* Icon */}
                <div className={`${colorClasses.text} shrink-0`}>
                  {renderIcon(group.icon, "w-5 h-5")}
                </div>

                {/* Group Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-medium truncate">{group.label}</h4>
                    <a 
                      href={getShareUrl(group.id)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-mono"
                    >
                      {group.shareCode}
                    </a>
                  </div>
                  <p className="text-xs text-[#71717a] truncate">
                    {group.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleEdit(group)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  {!group.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteClick(group)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-8 text-[#71717a]">
            <p className="mb-2">No groups yet</p>
            <Button onClick={handleCreate} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Group
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <GroupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        group={editingGroup}
        onSave={handleSave}
        onDelete={handleDeleteFromDialog}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{groupToDelete?.label}"? This will remove all visibility settings for this group. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}