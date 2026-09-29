import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { communityApi } from '../services/communityApi'
import { getApiErrorMessage } from '../services/api'
import type {
  CommunityPost,
  CommunityPostType,
  CommunityComment,
} from '../types'

const POST_TYPES: { label: string; value: CommunityPostType; color: string; bg: string }[] = [
  { label: 'Doubt', value: 'DOUBT', color: 'text-amber-800 border-amber-300', bg: 'bg-amber-50' },
  { label: 'Question', value: 'QUESTION', color: 'text-blue-800 border-blue-300', bg: 'bg-blue-50' },
  { label: 'Achievement', value: 'ACHIEVEMENT', color: 'text-emerald-800 border-emerald-300', bg: 'bg-emerald-50' },
  { label: 'Advice', value: 'ADVICE', color: 'text-purple-800 border-purple-300', bg: 'bg-purple-50' },
  { label: 'Discussion', value: 'DISCUSSION', color: 'text-indigo-800 border-indigo-300', bg: 'bg-indigo-50' },
]

function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'CH'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export default function CommunityPage() {
  const { user } = useAuth()

  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Filtering
  const [selectedType, setSelectedType] = useState<CommunityPostType | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Create Post Modal / Collapse
  const [isCreating, setIsCreating] = useState(false)
  const [postTitle, setPostTitle] = useState('')
  const [postContent, setPostContent] = useState('')
  const [postType, setPostType] = useState<CommunityPostType>('QUESTION')
  const [isSubmittingPost, setIsSubmittingPost] = useState(false)

  // Comments State (Keyed by postId)
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({})
  const [commentsByPost, setCommentsByPost] = useState<Record<number, CommunityComment[]>>({})
  const [newCommentText, setNewCommentText] = useState<Record<number, string>>({})
  const [isSubmittingComment, setIsSubmittingComment] = useState<Record<number, boolean>>({})

  const loadPosts = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const typeParam = selectedType === 'ALL' ? undefined : selectedType
      const data = await communityApi.getPosts(typeParam)
      setPosts(data)
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, 'Failed to load community posts'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [selectedType])

  const handleCreatePost = async (e: FormEvent) => {
    e.preventDefault()
    if (!postTitle.trim() || !postContent.trim()) {
      setErrorMessage('Please fill in both the title and content.')
      return
    }

    setIsSubmittingPost(true)
    setErrorMessage(null)
    try {
      const newPost = await communityApi.createPost({
        title: postTitle.trim(),
        content: postContent.trim(),
        type: postType,
      })
      setPosts([newPost, ...posts])
      setPostTitle('')
      setPostContent('')
      setIsCreating(false)
      setSuccessMessage('Post shared with your campus community!')
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, 'Failed to create post'))
    } finally {
      setIsSubmittingPost(false)
    }
  }

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return

    try {
      await communityApi.deletePost(postId)
      setPosts(posts.filter((p) => p.id !== postId))
      setSuccessMessage('Post deleted successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, 'Failed to delete post'))
    }
  }

  const toggleComments = async (postId: number) => {
    const isCurrentlyExpanded = !!expandedComments[postId]
    setExpandedComments((prev) => ({ ...prev, [postId]: !isCurrentlyExpanded }))

    if (!isCurrentlyExpanded && !commentsByPost[postId]) {
      try {
        const comments = await communityApi.getComments(postId)
        setCommentsByPost((prev) => ({ ...prev, [postId]: comments }))
      } catch (err) {
        setErrorMessage(getApiErrorMessage(err, 'Failed to load comments'))
      }
    }
  }

  const handleAddComment = async (postId: number, e: FormEvent) => {
    e.preventDefault()
    const content = newCommentText[postId]?.trim()
    if (!content) return

    setIsSubmittingComment((prev) => ({ ...prev, [postId]: true }))
    try {
      const comment = await communityApi.addComment(postId, { content })
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), comment],
      }))
      setNewCommentText((prev) => ({ ...prev, [postId]: '' }))
      // Update comment count in post list
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p))
      )
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, 'Failed to post comment'))
    } finally {
      setIsSubmittingComment((prev) => ({ ...prev, [postId]: false }))
    }
  }

  const handleDeleteComment = async (postId: number, commentId: number) => {
    if (!window.confirm('Delete this comment?')) return

    try {
      await communityApi.deleteComment(commentId)
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
      }))
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, commentCount: Math.max(0, p.commentCount - 1) } : p))
      )
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, 'Failed to delete comment'))
    }
  }

  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      post.title.toLowerCase().includes(q) ||
      post.content.toLowerCase().includes(q) ||
      post.authorName.toLowerCase().includes(q)
    )
  })

  const getTypeStyle = (type: CommunityPostType) => {
    const found = POST_TYPES.find((t) => t.value === type)
    return found ? `${found.bg} ${found.color}` : 'bg-slate-100 text-slate-800 border-slate-200'
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" aria-hidden="true" />
            <span>{user?.collegeName || 'Campus Community'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Campus Community
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Exchange ideas, resolve doubts, celebrate milestones, and connect with peers in your college.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-center"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>{isCreating ? 'Close Form' : 'New Post'}</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
          <span>✓ {successMessage}</span>
          <button type="button" onClick={() => setSuccessMessage(null)} className="text-emerald-900 font-bold ml-2">×</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-between">
          <span>⚠️ {errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-rose-900 font-bold ml-2">×</button>
        </div>
      )}

      {/* Create Post Form */}
      {isCreating && (
        <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Create a Community Post</h2>
            <span className="text-xs text-slate-500">Visible only to {user?.collegeName || 'your college'}</span>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label htmlFor="post-type" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Post Category / Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {POST_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setPostType(t.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                      postType === t.value
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="post-title" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Title
              </label>
              <input
                id="post-title"
                type="text"
                required
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="e.g. Any study groups for Discrete Mathematics midterms?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label htmlFor="post-content" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description / Discussion Details
              </label>
              <textarea
                id="post-content"
                required
                rows={4}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Provide context, references, or specific questions..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingPost}
                className="px-5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {isSubmittingPost ? 'Posting...' : 'Publish Post'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedType === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Topics
          </button>
          {POST_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setSelectedType(t.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedType === t.value
                  ? 'bg-indigo-700 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <input
            type="text"
            placeholder="Search discussion feed..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Posts Feed */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-500 text-sm">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading campus community feed...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 font-bold text-xl">
            💬
          </div>
          <h3 className="text-base font-bold text-slate-900">No community posts found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {searchQuery
              ? 'Try changing your search term or filter category.'
              : `Be the first to start a conversation in ${user?.collegeName || 'your college'}!`}
          </p>
          {!isCreating && (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold cursor-pointer"
            >
              Create the First Post
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const isAuthor = user?.id === post.authorId
            const isAdmin = user?.role?.toUpperCase() === 'ADMIN'
            const canDelete = isAuthor || isAdmin
            const commentsOpen = !!expandedComments[post.id]
            const postComments = commentsByPost[post.id] || []

            return (
              <article
                key={post.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Post Author Bar */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {post.authorProfileImageUrl ? (
                      <img
                        src={post.authorProfileImageUrl}
                        alt={post.authorName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200 shrink-0">
                        {getInitials(post.authorName)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{post.authorName}</p>
                      <p className="text-[11px] text-slate-500">{formatDate(post.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getTypeStyle(
                        post.type
                      )}`}
                    >
                      {post.type}
                    </span>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete post"
                        aria-label="Delete post"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                    {post.content}
                  </p>
                </div>

                {/* Footer Strip */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => toggleComments(post.id)}
                    className="inline-flex items-center gap-1.5 font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span>
                      {post.commentCount} {post.commentCount === 1 ? 'Comment' : 'Comments'}
                    </span>
                    <span className="text-[10px] ml-1">{commentsOpen ? '▲' : '▼'}</span>
                  </button>

                  <span className="text-[11px] text-slate-400">
                    {post.collegeName}
                  </span>
                </div>

                {/* Comments Section */}
                {commentsOpen && (
                  <div className="pt-3 border-t border-slate-100 space-y-3 bg-slate-50/60 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 sm:p-5 rounded-b-2xl">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Comments ({postComments.length})
                    </h3>

                    {/* Existing Comments */}
                    {postComments.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-2">
                        No responses yet. Be the first to share your thoughts!
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {postComments.map((comment) => {
                          const canDeleteComment =
                            user?.id === comment.authorId || user?.role?.toUpperCase() === 'ADMIN'

                          return (
                            <div
                              key={comment.id}
                              className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  {comment.authorProfileImageUrl ? (
                                    <img
                                      src={comment.authorProfileImageUrl}
                                      alt={comment.authorName}
                                      className="w-5 h-5 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[9px] flex items-center justify-center">
                                      {getInitials(comment.authorName)}
                                    </div>
                                  )}
                                  <span className="font-bold text-slate-800">{comment.authorName}</span>
                                  <span className="text-slate-400 text-[10px]">
                                    {formatDate(comment.createdAt)}
                                  </span>
                                </div>

                                {canDeleteComment && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(post.id, comment.id)}
                                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                                    title="Delete comment"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-slate-700 pl-7 leading-relaxed">
                                {comment.content}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Add Comment Form */}
                    <form
                      onSubmit={(e) => handleAddComment(post.id, e)}
                      className="flex items-center gap-2 pt-1"
                    >
                      <input
                        type="text"
                        required
                        placeholder="Write a helpful response..."
                        value={newCommentText[post.id] || ''}
                        onChange={(e) =>
                          setNewCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingComment[post.id]}
                        className="px-3.5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer shadow-2xs shrink-0"
                      >
                        {isSubmittingComment[post.id] ? '...' : 'Reply'}
                      </button>
                    </form>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
