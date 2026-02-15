import { useAuth } from '../context/AuthContext'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useNewsQuery } from '../query/useNewsQuery'
import { useTagsQuery } from '../query/useTagsQuery'
import { useReportersQuery } from '../query/useReportersQuery'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { MultiSelect } from '../components/ui/multi-select'
import { Editor } from '../components/Editor'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { Checkbox } from '../components/ui/checkbox'
import { toast } from 'sonner'
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Image as ImageIcon, 
  Save, 
  ArrowLeft,
  Loader2,
  X,
  Globe,
  RefreshCw
} from 'lucide-react'

import { generateSlugFromTitle } from '../lib/slug-utils'

export const Route = createFileRoute('/$newsId')({
  component: NewsDetailComponent,
})

function NewsDetailComponent() {
  const { newsId } = Route.useParams()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const { 
    useNewsItemQuery, 
    createNews, 
    updateNews, 
    uploadMedia, 
    isUploading,
    uploadOgImage,
    isUploadingOgImage
  } = useNewsQuery()
  const { tags: allTags, isLoading: isTagsLoading } = useTagsQuery()
  const { reporters: allReporters, isLoading: isReportersLoading } = useReportersQuery()
  
  const isEdit = newsId !== 'add-news'
  const { data: newsData, isLoading: isDataLoading } = useNewsItemQuery(newsId)

  const [formData, setFormData] = useState<any>({
    title: '',
    content: '',
    slug: '',
    keywords: [],
    isPublished: false,
    eventDateEn: '',
    eventDateNp: '',
     platforms: [],
    tags: [],
    authors: [],
    media: [],
    links: [],
    ogImage: '',
    createdAt: '',
  })

  const [newKeyword, setNewKeyword] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isAutoSlug, setIsAutoSlug] = useState(!isEdit)
  const [isSlugLoading, setIsSlugLoading] = useState(false)

  // Sync data when fetching is done
  useEffect(() => {
    if (isEdit && newsData) {
      setFormData({
        ...newsData,
        eventDateEn: newsData.eventDateEn || '',
        keywords: newsData.keywords || [],
         platforms: newsData.platforms || [],
        tags: newsData.tags || [],
        authors: newsData.authors?.map((a: any) => a.userId) || [],
        media: newsData.media || [],
        links: newsData.links || [],
        ogImage: newsData.ogImage || '',
        createdAt: newsData.createdAt ? (() => {
          const d = new Date(newsData.createdAt);
          const pad = (n: number) => n.toString().padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        })() : '',
      })
      // Disable auto-slug on existing news to prevent accidental breaks
      setIsAutoSlug(false)
    }
  }, [isEdit, newsData])

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate({ to: '/login' })
    }
  }, [isAuthenticated, isAuthLoading, navigate])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData((prev: any) => ({ ...prev, title }))
  }

  // Debounced Slug Generation
  useEffect(() => {
    if (isAutoSlug && formData.title.trim()) {
      const timer = setTimeout(async () => {
        setIsSlugLoading(true)
        try {
          const slug = await generateSlugFromTitle(formData.title)
          setFormData((prev: any) => ({ ...prev, slug }))
        } finally {
          setIsSlugLoading(false)
        }
      }, 1000) // 1s debounce
      return () => clearTimeout(timer)
    }
  }, [formData.title, isAutoSlug])

  const regenerateSlug = async () => {
    setIsSlugLoading(true)
    try {
      const slug = await generateSlugFromTitle(formData.title)
      setFormData((prev: any) => ({ ...prev, slug }))
    } finally {
      setIsSlugLoading(false)
    }
  }



  const addKeyword = () => {
    if (formData.keywords.length >= 5) {
      toast.warning('Maximum 5 keywords allowed')
      return
    }
    const kw = newKeyword.trim()
    if (kw && !formData.keywords.includes(kw)) {
      setFormData((prev: any) => ({ ...prev, keywords: [...prev.keywords, kw] }))
      setNewKeyword('')
    }
  }

  const removeKeyword = (kw: string) => {
    setFormData((prev: any) => ({
      ...prev,
      keywords: prev.keywords.filter((k: string) => k !== kw),
    }))
  }

  const togglePlatform = (platform: string) => {
    setFormData((prev: any) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p: string) => p !== platform)
        : [...prev.platforms, platform],
    }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const result = await uploadMedia(file)
      const newItem = {
        type: 'image',
        url: result.url,
        sortOrder: formData.media.length + 1,
      }
      setFormData((prev: any) => ({
        ...prev,
        media: [...prev.media, newItem],
      }))
      toast.success('Image uploaded successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Upload failed')
    }
  }

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 500 * 1024) {
      toast.error('OG image must be under 500KB')
      return
    }

    try {
      const result = await uploadOgImage({ newsId, file })
      setFormData((prev: any) => ({ ...prev, ogImage: result.url }))
      toast.success('OG image uploaded successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'OG image upload failed')
    }
  }

  const addVideoUrl = () => {
    const url = prompt('Enter video URL:')
    if (url) {
      setFormData((prev: any) => ({
        ...prev,
        media: [...prev.media, { type: 'video_url', url, sortOrder: prev.media.length + 1 }],
      }))
    }
  }

  const addLink = () => {
    setFormData((prev: any) => ({
      ...prev,
      links: [...prev.links, { label: '', url: '', sortOrder: prev.links.length + 1 }],
    }))
  }

  const updateLink = (index: number, field: string, value: string) => {
    const newLinks = [...formData.links]
    // Auto-prepend https:// if url field and missing protocol
    let finalValue = value
    if (field === 'url' && value && !value.startsWith('http://') && !value.startsWith('https://')) {
      finalValue = `https://${value}`
    }
    newLinks[index] = { ...newLinks[index], [field]: finalValue }
    setFormData((prev: any) => ({ ...prev, links: newLinks }))
  }

  const moveItem = (type: 'media' | 'links', index: number, direction: 'up' | 'down') => {
    const list = [...formData[type]]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= list.length) return

    [list[index], list[targetIndex]] = [list[targetIndex], list[index]]
    
    // Re-check sort orders
    const updated = list.map((item, i) => ({ ...item, sortOrder: i + 1 }))
    setFormData((prev: any) => ({ ...prev, [type]: updated }))
  }

  const removeItem = (type: 'media' | 'links', index: number) => {
    const list = formData[type].filter((_: any, i: number) => i !== index)
    const updated = list.map((item: any, i: number) => ({ ...item, sortOrder: i + 1 }))
    setFormData((prev: any) => ({ ...prev, [type]: updated }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (isEdit) {
        await updateNews({ id: newsId, data: formData })
        toast.success('News updated successfully')
      } else {
        const result = await createNews(formData)
        toast.success('News created successfully')
        navigate({ to: '/$newsId', params: { newsId: result.id } })
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save news')
    } finally {
      setIsSaving(false)
    }
  }

  if (isAuthLoading || (isEdit && isDataLoading)) {
    return (
      <div className="flex items-center justify-center min-vh-100">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const platformsList = [
    "x", "instagram", "facebook", "tiktok", "youtube", "web", "reddit", 
    "whatsapp", "viber", "telegram", "email", "tv", "radio", "print", "others"
  ]

  return (
    <div className="container mx-auto py-8 max-w-5xl px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/' })}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEdit ? 'Edit News' : 'Add New News'}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? `Editing: ${formData.title}` : 'Create a new news publication'}
            </p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? 'Update News' : 'Create News'}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="meta">Metadata</TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Article Content</CardTitle>
                <CardDescription>The core information of your news story.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    value={formData.title} 
                    onChange={handleTitleChange} 
                    placeholder="Headline of the story"
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="slug">Slug</Label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="auto-slug" 
                          checked={isAutoSlug} 
                          onCheckedChange={(checked) => setIsAutoSlug(!!checked)} 
                        />
                        <Label htmlFor="auto-slug" className="text-xs text-muted-foreground cursor-pointer">Auto-generate</Label>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 text-xs gap-1"
                        onClick={regenerateSlug}
                      >
                        <RefreshCw className="w-3 h-3" /> Regenerate
                      </Button>
                    </div>
                  </div>
                   <div className="relative">
                    <Input 
                      id="slug" 
                      value={formData.slug} 
                      onChange={(e) => {
                        // Sanitize: lowercase, replace spaces/special chars with hyphen, only allow a-z and -
                        const sanitized = e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, '-')           // Replace spaces with hyphens
                          .replace(/[^a-z0-9-]/g, '')    // Remove anything that's not a-z, 0-9, or hyphen
                          .replace(/-+/g, '-')            // Collapse multiple hyphens
                        setFormData({...formData, slug: sanitized})
                        setIsAutoSlug(false)
                      }} 
                      placeholder="url-slug-here"
                      required 
                      className={isSlugLoading ? "pr-10" : ""}
                    />
                    {isSlugLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    URL-friendly Romanized version of the title. Essential for SEO.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Full Content</Label>
                  <Editor
                    value={formData.content}
                    onChange={(value) => setFormData({...formData, content: value})}
                    placeholder="Write the full story in Nepali or English..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="eventDateEn">Event Date (English)</Label>
                    <Input 
                      type="date" 
                      id="eventDateEn" 
                      value={formData.eventDateEn} 
                      onChange={(e) => setFormData({...formData, eventDateEn: e.target.value})} 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="eventDateNp">Event Date (Nepali)</Label>
                    <Input 
                      id="eventDateNp" 
                      value={formData.eventDateNp} 
                      onChange={(e) => setFormData({...formData, eventDateNp: e.target.value})} 
                      placeholder="e.g. २०८० फागुन २२"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Media Assets</CardTitle>
                  <CardDescription>Add images or video URLs to your story.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Button type="button" variant="outline" size="sm" className="gap-2" disabled={isUploading}>
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                      Upload Image
                    </Button>
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={handleFileUpload}
                      accept="image/*"
                      disabled={isUploading}
                    />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addVideoUrl} className="gap-2">
                    <Globe className="w-4 h-4" /> Add Video URL
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.media.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                    No media assets added yet.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {formData.media.map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                        <div className="bg-muted w-24 h-24 rounded overflow-hidden flex items-center justify-center">
                          {item.type === 'image' ? (
                            <img src={item.url} alt="Media" className="object-cover w-full h-full" />
                          ) : (
                            <Globe className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                          <Badge variant="outline" className="mb-1">{item.type}</Badge>
                          <p className="text-sm break-all text-muted-foreground font-mono" title={item.url}>{item.url}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => moveItem('media', index, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => moveItem('media', index, 'down')}
                            disabled={index === formData.media.length - 1}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem('media', index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="links">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Reference Links</CardTitle>
                  <CardDescription>Add external links for more information.</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addLink} className="gap-2">
                  <Plus className="w-4 h-4" /> Add Link
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.links.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                    No reference links added yet.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {formData.links.map((link: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Input 
                          placeholder="Label" 
                          className="w-1/3" 
                          value={link.label} 
                          onChange={(e) => updateLink(index, 'label', e.target.value)} 
                        />
                        <Input 
                          placeholder="URL" 
                          className="flex-1" 
                          value={link.url} 
                          onChange={(e) => updateLink(index, 'url', e.target.value)} 
                        />
                        <div className="flex gap-1">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => moveItem('links', index, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => moveItem('links', index, 'down')}
                            disabled={index === formData.links.length - 1}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem('links', index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meta">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Visibility & Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="publish" 
                      checked={formData.isPublished} 
                      onCheckedChange={(checked) => setFormData({...formData, isPublished: !!checked})} 
                    />
                    <Label htmlFor="publish" className="text-base font-medium">Published</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Draft news will not be visible on the public website.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Publication Date</CardTitle>
                  <CardDescription>Adjust the created at date of this article.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <Label htmlFor="createdAt">Created At</Label>
                    <Input 
                      type="datetime-local" 
                      id="createdAt" 
                      value={formData.createdAt} 
                      onChange={(e) => setFormData({...formData, createdAt: e.target.value})} 
                    />
                    <p className="text-[10px] text-muted-foreground">
                      This date is used for sorting news on the public website.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Open Graph (OG) Image</CardTitle>
                  <CardDescription>Upload a custom image for social media sharing (Max 500KB).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.ogImage ? (
                    <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border bg-muted group">
                      <img src={formData.ogImage} alt="OG" className="object-cover w-full h-full" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <div className="relative">
                          <Button size="sm" variant="secondary" disabled={isUploadingOgImage}>
                            {isUploadingOgImage ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                            Change
                          </Button>
                          <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={handleOgImageUpload}
                            accept="image/*"
                            disabled={isUploadingOgImage}
                          />
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => setFormData({...formData, ogImage: ''})}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full h-32 border-2 border-dashed flex flex-col gap-2" 
                        disabled={isUploadingOgImage || !isEdit}
                      >
                        {isUploadingOgImage ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                        <span>{!isEdit ? 'Save news first to upload OG Image' : isUploadingOgImage ? 'Uploading...' : 'Upload OG Image'}</span>
                      </Button>
                      {isEdit && (
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          onChange={handleOgImageUpload}
                          accept="image/*"
                          disabled={isUploadingOgImage}
                        />
                      )}
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    Recommended size: 1200x630px. Only JPG, PNG, and WebP are allowed.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platforms</CardTitle>
                  <CardDescription>Which platforms does this story belong to?</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {platformsList.map(platform => (
                      <Badge 
                        key={platform} 
                        variant={formData.platforms.includes(platform) ? "default" : "outline"}
                        className="cursor-pointer capitalize px-3 py-1"
                        onClick={() => togglePlatform(platform)}
                      >
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tags & Keywords</CardTitle>
                  <CardDescription>Organize your story and optimize for search.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Tags</Label>
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {formData.tags.length} / 5 selected
                      </Badge>
                    </div>
                    
                     <MultiSelect
                      options={allTags?.map((t: any) => ({ id: t.name, name: t.name })) || []}
                      selected={formData.tags}
                      onChange={(tags) => setFormData((prev: any) => ({ ...prev, tags }))}
                      placeholder={isTagsLoading ? "Loading tags..." : "Browse tags..."}
                      maxItems={5}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Authors / Reporters</Label>
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {formData.authors.length} selected
                      </Badge>
                    </div>
                    
                    <MultiSelect
                      options={allReporters?.map((r: any) => ({ id: r.id, name: r.name })) || []}
                      selected={formData.authors}
                      onChange={(authors) => setFormData((prev: any) => ({ ...prev, authors }))}
                      placeholder={isReportersLoading ? "Loading reporters..." : "Add authors..."}
                      maxItems={10}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Keywords (Meta)</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Add keyword..." 
                        value={newKeyword} 
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                      />
                      <Button type="button" variant="secondary" onClick={addKeyword}><Plus className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.keywords.map((kw: string) => (
                        <Badge key={kw} variant="secondary" className="gap-1">
                          {kw}
                          <button type="button" onClick={() => removeKeyword(kw)} className="hover:text-red-400">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
