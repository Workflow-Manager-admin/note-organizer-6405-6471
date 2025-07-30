import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

test("renders notes app UI root", () => {
  render(<App />);
  const sidebar = screen.getByText(/Notes/i);
  expect(sidebar).toBeInTheDocument();
});

test("can add a note and see it in list", () => {
  render(<App />);
  fireEvent.click(screen.getByText("+ New Note"));
  const titleBox = screen.getByPlaceholderText("Title");
  fireEvent.change(titleBox, { target: { value: "New Note" } });
  const textArea = screen.getByPlaceholderText("Type your note here...");
  fireEvent.change(textArea, { target: { value: "Test body" } });
  fireEvent.click(screen.getByText("Save"));
  expect(screen.getByText(/New Note/i)).toBeInTheDocument();
});

test("can search notes", () => {
  render(<App />);
  const search = screen.getByPlaceholderText(/Search notes/i);
  fireEvent.change(search, { target: { value: "welcome" } });
  expect(screen.getByText(/Welcome to Notes!/i)).toBeInTheDocument();
});

