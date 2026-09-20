"use client";

import { useDeleteUser } from "./hooks/use-delete-user";
import { DeleteUserView } from "./parts/delete-user-view";

interface DeleteUserProps {
  user: import("@next-phish/backend").UserView | null;
  onClose: () => void;
}

interface ActiveDeleteUserProps {
  user: import("@next-phish/backend").UserView;
  onClose: () => void;
}

export function DeleteUser({ user, onClose }: DeleteUserProps) {
  return user ? (
    <ActiveDeleteUser key={user.id} user={user} onClose={onClose} />
  ) : null;
}

function ActiveDeleteUser({ user, onClose }: ActiveDeleteUserProps) {
  const model = useDeleteUser(user, onClose);
  return (
    <DeleteUserView
      user={user}
      onClose={onClose}
      {...model}
      onConfirm={() => void model.onConfirm()}
    />
  );
}
