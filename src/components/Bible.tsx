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
import { api } from "@/trpc/react";
import { BooksResponse, ChapterResponse } from "@/server/api/routers/bible";
import { VersionsResponse } from "@/server/api/routers/bible";

function BibleUI({
  versions,
  books,
  initialChapter,
}: {
  versions: VersionsResponse;
  books: BooksResponse;
  initialChapter: ChapterResponse;
}) {
  const [selectedVersion, setSelectedVersion] = useState("nvi");
  const [selectedBook, setSelectedBook] = useState(books[0]);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const versesData = api.bible.getChapter.useQuery({
    version: selectedVersion,
    abbrev: selectedBook?.abbrev?.pt ?? "gn",
    chapter: selectedChapter,
  });
  const oldTestamentBooks = books.filter((book) => book.testament === "VT");
  const newTestamentBooks = books.filter((book) => book.testament === "NT");

  const handlePreviousChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
    } else {
      // Go to previous book, last chapter
      const currentBookIndex = books.findIndex(
        (book) => book.name === selectedBook?.name,
      );
      if (currentBookIndex > 0) {
        const previousBook = books[currentBookIndex - 1];
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
      const currentBookIndex = books.findIndex(
        (book) => book.name === selectedBook?.name,
      );
      if (currentBookIndex < books.length - 1) {
        setSelectedBook(books[currentBookIndex + 1]);
        setSelectedChapter(1);
      }
    }
  };

  const BookList = ({
    books,
    title,
  }: {
    books: BooksResponse;
    title: string;
  }) => (
    <div className="mb-6">
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-1">
        {books.map((book) => (
          <Button
            key={book.name}
            variant={selectedBook?.name === book.name ? "secondary" : "ghost"}
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
                  <BookList
                    books={oldTestamentBooks}
                    title="Velho Testamento"
                  />
                  <BookList books={newTestamentBooks} title="Novo Testamento" />
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
              {versions.map((version) => (
                <SelectItem key={version.version} value={version.version}>
                  {version.version}
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
                    selectedBook.name === books?.[0].name &&
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
                    selectedBook.name === books[books.length - 1].name &&
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
              {versesData.data?.verses.map((verse) => (
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

export default function Bible() {
  const versions = api.bible.getVersions.useQuery();
  const books = api.bible.getBooks.useQuery();
  const verses = api.bible.getChapter.useQuery({
    version: "nvi",
    abbrev: "gn",
    chapter: 1,
  });
  if (versions.isLoading || books.isLoading || verses.isLoading) {
    return <div>Loading...</div>;
  }

  if (!versions.data || !books.data || !verses.data) {
    return <div>Error loading data</div>;
  }
  console.log(verses.data);
  return (
    <BibleUI
      versions={versions.data}
      books={books.data}
      initialChapter={verses.data}
    />
  );
}
