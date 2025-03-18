"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronLeft, ChevronRight, Menu, Search } from "lucide-react";

// Bible data structure (simplified)
const bibleVersions = ["KJV", "NIV", "ESV", "NKJV", "NLT"];

const bibleBooks = [
  // Old Testament
  { id: "genesis", name: "Genesis", testament: "old", chapters: 50 },
  { id: "exodus", name: "Exodus", testament: "old", chapters: 40 },
  { id: "leviticus", name: "Leviticus", testament: "old", chapters: 27 },
  // More Old Testament books would be added here

  // New Testament
  { id: "matthew", name: "Matthew", testament: "new", chapters: 28 },
  { id: "mark", name: "Mark", testament: "new", chapters: 16 },
  { id: "luke", name: "Luke", testament: "new", chapters: 24 },
  { id: "john", name: "John", testament: "new", chapters: 21 },
  { id: "acts", name: "Acts", testament: "new", chapters: 28 },
  // More New Testament books would be added here
];

// Sample verse data for demonstration
const sampleVerses = [
  { number: 1, text: "In the beginning God created the heaven and the earth." },
  {
    number: 2,
    text: "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.",
  },
  { number: 3, text: "And God said, Let there be light: and there was light." },
  {
    number: 4,
    text: "And God saw the light, that it was good: and God divided the light from the darkness.",
  },
  {
    number: 5,
    text: "And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.",
  },
  // More verses would be added here
];

export default function BibleUI() {
  const [selectedVersion, setSelectedVersion] = useState("KJV");
  const [selectedBook, setSelectedBook] = useState(bibleBooks[0]);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const oldTestamentBooks = bibleBooks.filter(
    (book) => book.testament === "old",
  );
  const newTestamentBooks = bibleBooks.filter(
    (book) => book.testament === "new",
  );

  const handlePreviousChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
    } else {
      // Go to previous book, last chapter
      const currentBookIndex = bibleBooks.findIndex(
        (book) => book.id === selectedBook.id,
      );
      if (currentBookIndex > 0) {
        const previousBook = bibleBooks[currentBookIndex - 1];
        setSelectedBook(previousBook);
        setSelectedChapter(previousBook.chapters);
      }
    }
  };

  const handleNextChapter = () => {
    if (selectedChapter < selectedBook.chapters) {
      setSelectedChapter(selectedChapter + 1);
    } else {
      // Go to next book, first chapter
      const currentBookIndex = bibleBooks.findIndex(
        (book) => book.id === selectedBook.id,
      );
      if (currentBookIndex < bibleBooks.length - 1) {
        setSelectedBook(bibleBooks[currentBookIndex + 1]);
        setSelectedChapter(1);
      }
    }
  };

  const BookList = ({ books, title }) => (
    <div className="mb-6">
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-1">
        {books.map((book) => (
          <Button
            key={book.id}
            variant={selectedBook.id === book.id ? "secondary" : "ghost"}
            className="h-8 justify-start"
            onClick={() => {
              setSelectedBook(book);
              setSelectedChapter(1);
              setIsMobileMenuOpen(false);
            }}
          >
            {book.name}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-background sticky top-0 z-10 flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="py-4">
                <h2 className="mb-4 text-xl font-bold">Bible Books</h2>
                <ScrollArea className="h-[calc(100vh-100px)]">
                  <BookList books={oldTestamentBooks} title="Old Testament" />
                  <BookList books={newTestamentBooks} title="New Testament" />
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-xl font-bold">Bible Reader</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden md:flex">
            <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-[200px] pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedVersion} onValueChange={setSelectedVersion}>
            <SelectTrigger className="w-[90px]">
              <SelectValue placeholder="Version" />
            </SelectTrigger>
            <SelectContent>
              {bibleVersions.map((version) => (
                <SelectItem key={version} value={version}>
                  {version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Hidden on mobile */}
        <aside className="hidden w-[240px] border-r p-4 md:block">
          <ScrollArea className="h-[calc(100vh-100px)]">
            <BookList books={oldTestamentBooks} title="Old Testament" />
            <BookList books={newTestamentBooks} title="New Testament" />
          </ScrollArea>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4">
          <div className="mx-auto max-w-3xl">
            {/* Chapter navigation */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {selectedBook.name} {selectedChapter}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousChapter}
                  disabled={
                    selectedBook.id === bibleBooks[0].id &&
                    selectedChapter === 1
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous chapter</span>
                </Button>
                <Select
                  value={selectedChapter.toString()}
                  onValueChange={(value) =>
                    setSelectedChapter(Number.parseInt(value))
                  }
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="Chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      { length: selectedBook.chapters },
                      (_, i) => i + 1,
                    ).map((chapter) => (
                      <SelectItem key={chapter} value={chapter.toString()}>
                        {chapter}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextChapter}
                  disabled={
                    selectedBook.id === bibleBooks[bibleBooks.length - 1].id &&
                    selectedChapter === selectedBook.chapters
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next chapter</span>
                </Button>
              </div>
            </div>

            {/* Verse content */}
            <div className="space-y-4">
              {sampleVerses.map((verse) => (
                <div key={verse.number} className="flex">
                  <span className="text-muted-foreground mr-2 font-bold">
                    {verse.number}
                  </span>
                  <p>{verse.text}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
