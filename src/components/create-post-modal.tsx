import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, ImageIcon, Link2, Megaphone } from "lucide-react";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (postData: { title: string; content: string; community: string; postType: string; contentType: string }) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onCreatePost,
}) => {
  const [postType, setPostType] = useState<"text" | "image" | "link">("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [community, setCommunity] = useState("");
  const [contentType, setContentType] = useState<"post" | "voice">("post");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && community) {
      onCreatePost({ title, content, community, postType, contentType });
      setTitle("");
      setContent("");
      setCommunity("");
      setPostType("text");
      onClose();
    }
  };

  const getButtonText = () => {
    return contentType === "post" ? "Post as Post" : "Post as Voice";
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setCommunity("");
    setPostType("text");
    setContentType("post");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contentType === "voice" ? "Post your voice" : "Create a post"}</DialogTitle>
          <DialogDescription>
            {contentType === "voice" 
              ? "Share your voice with the community." 
              : "Share your thoughts with the community."
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Community Selector */}
            <div className="grid gap-2">
              <Label htmlFor="community">Target Audience</Label>
              <Select value={community} onValueChange={setCommunity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="followers">Followers</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="state">State</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                  <SelectItem value="world">World</SelectItem>
                  <SelectItem value="everyone">Everyone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content Type */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Content Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={contentType === "post" ? "default" : "outline"}
                  onClick={() => setContentType("post")}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Post
                </Button>
                <Button
                  type="button"
                  variant={contentType === "voice" ? "default" : "outline"}
                  onClick={() => setContentType("voice")}
                  className="flex-1"
                >
                  <Megaphone className="h-4 w-4 mr-2" />
                  Voice
                </Button>
              </div>
            </div>

            {/* Post Type Tabs */}
            <div className="flex gap-2 border-b">
              <button
                type="button"
                onClick={() => setPostType("text")}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                  postType === "text"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Text</span>
              </button>
              <button
                type="button"
                onClick={() => setPostType("image")}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                  postType === "image"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                <span>Image</span>
              </button>
              <button
                type="button"
                onClick={() => setPostType("link")}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                  postType === "link"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Link2 className="h-4 w-4" />
                <span>Link</span>
              </button>
            </div>

            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={300}
                required
              />
              <p className="text-xs text-muted-foreground">{title.length}/300</p>
            </div>

            {/* Content based on post type */}
            {postType === "text" && (
              <div className="grid gap-2">
                <Label htmlFor="content">Content (optional)</Label>
                <Textarea
                  id="content"
                  placeholder="Write your post content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>
            )}

            {postType === "image" && (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <ImageIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">Drag and drop image or</p>
                <Button type="button" variant="outline" size="sm">
                  Upload
                </Button>
              </div>
            )}

            {postType === "link" && (
              <div className="grid gap-2">
                <Label htmlFor="link">URL</Label>
                <Input
                  id="link"
                  placeholder="https://example.com"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  type="url"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!community || !title.trim()}>
              {getButtonText()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;