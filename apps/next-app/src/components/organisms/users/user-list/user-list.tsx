"use client";

import { CreateUser } from "../create-user";
import { DeleteUser } from "../delete-user";
import { useUserList } from "./hooks/use-user-list";
import { UserListView } from "./parts/user-list-view";

export function UserList() {
  const model = useUserList();
  return (
    <>
      <UserListView {...model.viewProps} />
      {model.createOpen && (
        <CreateUser
          visible
          onCreated={model.closeCreate}
          onCancel={model.closeCreate}
        />
      )}
      <DeleteUser user={model.deleting} onClose={model.closeDelete} />
    </>
  );
}
