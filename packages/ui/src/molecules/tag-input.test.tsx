import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TagInput } from "./tag-input";

function Fixture() {
  const [tags, setTags] = useState(["security"]);
  return (
    <TagInput
      value={tags}
      onValueChange={setTags}
      aria-label="Add tags"
      labels={{ tags: "Selected tags", remove: (tag) => `Remove ${tag}` }}
    />
  );
}

describe("TagInput", () => {
  it("adds tags with Enter and comma and removes them with Backspace", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    const input = screen.getByLabelText("Add tags");
    await user.type(input, "training{Enter}urgent,");
    expect(screen.getByText("training")).toBeInTheDocument();
    expect(screen.getByText("urgent")).toBeInTheDocument();
    await user.type(input, "{Backspace}");
    expect(screen.queryByText("urgent")).not.toBeInTheDocument();
  });

  it("splits pasted tags and removes a selected tag accessibly", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    const input = screen.getByLabelText("Add tags");
    await user.click(input);
    await user.paste("alpha, beta\ngamma");
    expect(screen.getByText("beta")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove alpha" }));
    expect(screen.queryByText("alpha")).not.toBeInTheDocument();
  });

  it("commits an unfinished tag while removing another", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Fixture />
        <button type="button">Outside</button>
      </>,
    );
    const input = screen.getByLabelText("Add tags");
    await user.type(input, "pending");
    await user.click(screen.getByRole("button", { name: "Remove security" }));
    expect(input).toHaveValue("");
    expect(screen.getByText("pending")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.getByText("pending")).toBeInTheDocument();
  });
});
