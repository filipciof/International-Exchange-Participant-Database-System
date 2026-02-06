import { useSyncExternalStore } from "react";

let listeners: (() => void)[] = [];

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return localStorage.getItem("activeGroup") || "";
}

export function setActiveGroup(group: string) {
  localStorage.setItem("activeGroup", group);
  listeners.forEach((l) => l());
}

type Permissions = {
  group: string;
  canViewSidebar: boolean;
  canViewStudents: boolean;
  canViewStaff: boolean;
  canViewClubs: boolean;
  canViewFamilies: boolean;
  canViewContacts: boolean;
  canEditExchanges: boolean;
  canAddDocuments: boolean;
  canEditDocuments: boolean;
  canToggleIsInbound: boolean;
  defaultIsInbound: boolean;
  canAssignGroups: boolean;
  canCreateHomeCountryClubs: boolean;
  hasLockedSendingClub: boolean;
  canEditStaffClubInfo: boolean;
  canEditStudentName: boolean;
  canEditStaffName: boolean;
};

function resolvePermissions(group: string): Permissions {
  switch (group) {
    case "admin":
      return {
        group,
        canViewSidebar: true,
        canViewStudents: true,
        canViewStaff: true,
        canViewClubs: true,
        canViewFamilies: true,
        canViewContacts: true,
        canEditExchanges: true,
        canAddDocuments: true,
        canEditDocuments: true,
        canToggleIsInbound: true,
        defaultIsInbound: true,
        canAssignGroups: true,
        canCreateHomeCountryClubs: true,
        hasLockedSendingClub: false,
        canEditStaffClubInfo: true,
        canEditStudentName: true,
        canEditStaffName: true,
      };
    case "correspondent":
      return {
        group,
        canViewSidebar: true,
        canViewStudents: true,
        canViewStaff: false,
        canViewClubs: true,
        canViewFamilies: true,
        canViewContacts: true,
        canEditExchanges: true,
        canAddDocuments: true,
        canEditDocuments: true,
        canToggleIsInbound: false,
        defaultIsInbound: true,
        canAssignGroups: false,
        canCreateHomeCountryClubs: false,
        hasLockedSendingClub: false,
        canEditStaffClubInfo: false,
        canEditStudentName: true,
        canEditStaffName: false,
      };
    case "kwm_officer":
      return {
        group,
        canViewSidebar: true,
        canViewStudents: true,
        canViewStaff: false,
        canViewClubs: true,
        canViewFamilies: true,
        canViewContacts: true,
        canEditExchanges: true,
        canAddDocuments: true,
        canEditDocuments: true,
        canToggleIsInbound: false,
        defaultIsInbound: true,
        canAssignGroups: false,
        canCreateHomeCountryClubs: false,
        hasLockedSendingClub: false,
        canEditStaffClubInfo: false,
        canEditStudentName: true,
        canEditStaffName: false,
      };
    case "club_officer":
      return {
        group,
        canViewSidebar: true,
        canViewStudents: true,
        canViewStaff: false,
        canViewClubs: false,
        canViewFamilies: true,
        canViewContacts: false,
        canEditExchanges: true,
        canAddDocuments: true,
        canEditDocuments: true,
        canToggleIsInbound: false,
        defaultIsInbound: false,
        canAssignGroups: false,
        canCreateHomeCountryClubs: false,
        hasLockedSendingClub: true,
        canEditStaffClubInfo: false,
        canEditStudentName: true,
        canEditStaffName: false,
      };
    case "student":
      return {
        group,
        canViewSidebar: false,
        canViewStudents: false,
        canViewStaff: false,
        canViewClubs: false,
        canViewFamilies: false,
        canViewContacts: false,
        canEditExchanges: false,
        canAddDocuments: true,
        canEditDocuments: false,
        canToggleIsInbound: false,
        defaultIsInbound: false,
        canAssignGroups: false,
        canCreateHomeCountryClubs: false,
        hasLockedSendingClub: false,
        canEditStaffClubInfo: false,
        canEditStudentName: false,
        canEditStaffName: false,
      };
    default:
      return {
        group,
        canViewSidebar: false,
        canViewStudents: false,
        canViewStaff: false,
        canViewClubs: false,
        canViewFamilies: false,
        canViewContacts: false,
        canEditExchanges: false,
        canAddDocuments: false,
        canEditDocuments: false,
        canToggleIsInbound: false,
        defaultIsInbound: false,
        canAssignGroups: false,
        canCreateHomeCountryClubs: false,
        hasLockedSendingClub: false,
        canEditStaffClubInfo: false,
        canEditStudentName: false,
        canEditStaffName: false,
      };
  }
}

export default function usePermissions(): Permissions {
  const group = useSyncExternalStore(subscribe, getSnapshot);
  return resolvePermissions(group);
}
