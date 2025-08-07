<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { z } from 'zod';
  import { slide } from 'svelte/transition';
  import { Check, X, Upload, Image as ImageIcon } from 'lucide-svelte';
  import RatingDisplay from '$lib/components/ui/rating/RatingDisplay.svelte';
  import Button from '$lib/components/ui/button/Button.svelte';
  
  // Schema for review validation
  const reviewSchema = z.object({
    rating: z.number().min(1, 'Por favor selecciona una calificación'),
    title: z.string()
      .min(3, 'El título debe tener al menos 3 caracteres')
      .max(200, 'El título no puede tener más de 200 caracteres'),
    comment: z.string()
      .min(10, 'El comentario debe tener al menos 10 caracteres')
      .max(2000, 'El comentario no puede tener más de 2000 caracteres'),
  });
  
  export let productName: string = '';
  export let initialData = {
    rating: 0,
    title: '',
    comment: '',
    images: [] as string[]
  };
  export let isSubmitting = false;
  export let error: string | null = null;
  
  const dispatch = createEventDispatcher<{
    submit: typeof reviewSchema._type;
    cancel: void;
  }>();
  
  let rating = $state(initialData.rating);
  let title = $state(initialData.title);
  let comment = $state(initialData.comment);
  let images = $state<string[]>(initialData.images);
  let validationErrors = $state<Record<string, string>>({});
  let isDragging = $state(false);
  let imageUploads = $state<Array<{ file: File; preview: string; isUploading: boolean; error?: string }>>([]);
  
  // Reset form when initialData changes
  $effect(() => {
    rating = initialData.rating;
    title = initialData.title;
    comment = initialData.comment;
    images = [...initialData.images];
    validationErrors = {};
    imageUploads = [];
  });
  
  function handleRatingChange(e: CustomEvent<number>) {
    rating = e.detail;
    if (validationErrors.rating) {
      const { rating: _, ...rest } = validationErrors;
      validationErrors = rest;
    }
  }
  
  function handleSubmit() {
    try {
      const result = reviewSchema.safeParse({ rating, title, comment });
      
      if (!result.success) {
        // Convert Zod errors to a more usable format
        validationErrors = result.error.errors.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        }, {} as Record<string, string>);
        return;
      }
      
      // If we have pending uploads, don't submit yet
      if (imageUploads.some(upload => upload.isUploading)) {
        error = 'Por favor espera a que se completen las cargas de imágenes';
        return;
      }
      
      // Submit the form with the validated data and image URLs
      dispatch('submit', {
        ...result.data,
        images: [...images, ...imageUploads.map(u => u.file.name)] // In a real app, this would be the uploaded URL
      });
      
    } catch (err) {
      console.error('Error submitting review:', err);
      error = 'Ocurrió un error al enviar la reseña. Por favor, inténtalo de nuevo.';
    }
  }
  
  function handleCancel() {
    dispatch('cancel');
  }
  
  // Image handling
  async function handleFileSelect(files: FileList) {
    const newUploads = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .slice(0, 5 - images.length - imageUploads.length) // Max 5 images total
      .map(file => ({
        file,
        preview: URL.createObjectURL(file),
        isUploading: true,
        error: undefined
      }));
    
    if (newUploads.length === 0) return;
    
    imageUploads = [...imageUploads, ...newUploads];
    
    // Simulate upload (in a real app, this would upload to a storage service)
    for (const upload of newUploads) {
      try {
        // TODO: Replace with actual file upload logic
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, you would get the URL from the upload response
        const uploadedUrl = `https://example.com/uploads/${Date.now()}_${upload.file.name}`;
        images = [...images, uploadedUrl];
        
        // Remove from uploads and update state
        imageUploads = imageUploads.map(u => 
          u === upload ? { ...u, isUploading: false } : u
        );
      } catch (err) {
        console.error('Error uploading image:', err);
        imageUploads = imageUploads.map(u => 
          u === upload 
            ? { ...u, isUploading: false, error: 'Error al cargar la imagen' } 
            : u
        );
      }
    }
  }
  
  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    isDragging = true;
  }
  
  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    isDragging = false;
  }
  
  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    isDragging = false;
    
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }
  
  function removeImage(index: number) {
    images = images.filter((_, i) => i !== index);
  }
  
  function removeUpload(index: number) {
    imageUploads = imageUploads.filter((_, i) => i !== index);
  }
  
  // Clean up object URLs
  $effect(() => {
    return () => {
      imageUploads.forEach(upload => {
        URL.revokeObjectURL(upload.preview);
      });
    };
  });
</script>

<div class="space-y-4">
  <h3 class="text-lg font-medium text-gray-900 dark:text-white">
    {initialData.rating ? 'Editar reseña' : 'Escribe una reseña'}
  </h3>
  
  {#if productName}
    <p class="text-sm text-gray-600 dark:text-gray-300">
      Estás opinando sobre: <span class="font-medium">{productName}</span>
    </p>
  {/if}
  
  {#if error}
    <div 
      class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
      role="alert"
    >
      {error}
    </div>
  {/if}
  
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Tu calificación *
      </label>
      <div class="flex items-center">
        <RatingDisplay 
          rating={rating} 
          size="lg" 
          interactive 
          on:rate={handleRatingChange}
        />
        <span class="ml-2 text-sm text-gray-500">
          {rating ? rating.toFixed(1) : '0.0'}
        </span>
      </div>
      {#if validationErrors.rating}
        <p class="mt-1 text-sm text-red-600 dark:text-red-400">
          {validationErrors.rating}
        </p>
      {/if}
    </div>
    
    <div>
      <label 
        for="review-title" 
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        Título de la reseña *
      </label>
      <input
        id="review-title"
        type="text"
        bind:value={title}
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        placeholder="Ej: Excelente producto, lo recomiendo"
        on:input={() => {
          if (validationErrors.title) {
            const { title: _, ...rest } = validationErrors;
            validationErrors = rest;
          }
        }}
      />
      {#if validationErrors.title}
        <p class="mt-1 text-sm text-red-600 dark:text-red-400">
          {validationErrors.title}
        </p>
      {/if}
    </div>
    
    <div>
      <label 
        for="review-comment" 
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        Tu opinión *
      </label>
      <textarea
        id="review-comment"
        bind:value={comment}
        rows={4}
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        placeholder="Cuéntanos tu experiencia con este producto..."
        on:input={() => {
          if (validationErrors.comment) {
            const { comment: _, ...rest } = validationErrors;
            validationErrors = rest;
          }
        }}
      />
      {#if validationErrors.comment}
        <p class="mt-1 text-sm text-red-600 dark:text-red-400">
          {validationErrors.comment}
        </p>
      {/if}
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Mínimo 10 caracteres. Tu opinión ayudará a otros compradores.
      </p>
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Fotos (opcional)
      </label>
      
      <div
        class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md {isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'dark:border-gray-600'}"
        on:dragover={handleDragOver}
        on:dragleave={handleDragLeave}
        on:drop={handleDrop}
      >
        <div class="space-y-1 text-center">
          <div class="flex text-sm text-gray-600 dark:text-gray-300 justify-center">
            <label
              for="file-upload"
              class="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
            >
              <span>Sube fotos</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                class="sr-only"
                accept="image/*"
                multiple
                on:change={(e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files) handleFileSelect(files);
                }}
              />
            </label>
            <p class="pl-1">o arrástralas aquí</p>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            PNG, JPG, GIF hasta 5MB (máx. 5 imágenes)
          </p>
        </div>
      </div>
      
      <!-- Preview uploaded and uploading images -->
      <div class="mt-2 flex flex-wrap gap-2">
        {#each images as url, i}
          <div class="relative group">
            <img 
              src={url} 
              alt={`Imagen ${i + 1}`}
              class="w-16 h-16 rounded-md object-cover border border-gray-200 dark:border-gray-600"
            />
            <button
              type="button"
              on:click={() => removeImage(i)}
              class="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Eliminar imagen"
            >
              <X class="w-3 h-3" />
            </button>
          </div>
        {/each}
        
        {#each imageUploads as upload, i}
          <div 
            class="relative w-16 h-16 rounded-md border border-gray-200 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-700 overflow-hidden"
            class:border-blue-500={upload.isUploading}
            class:border-red-500={upload.error}
          >
            {#if upload.isUploading}
              <div class="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            {:else if upload.error}
              <div class="absolute inset-0 bg-red-500/10 flex flex-col items-center justify-center p-1">
                <X class="w-4 h-4 text-red-500" />
                <span class="text-xs text-red-500 text-center">Error</span>
              </div>
            {:else}
              <img 
                src={upload.preview} 
                alt={`Subiendo ${upload.file.name}`}
                class="w-full h-full object-cover"
              />
            {/if}
            
            <button
              type="button"
              on:click={() => removeUpload(i)}
              class="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 hover:opacity-100 transition-opacity"
              aria-label="Cancelar carga"
            >
              <X class="w-3 h-3" />
            </button>
          </div>
        {/each}
      </div>
    </div>
    
    <div class="flex items-center justify-end space-x-3 pt-2">
      <Button
        type="button"
        variant="outline"
        on:click={handleCancel}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      <Button
        type="button"
        on:click={handleSubmit}
        disabled={isSubmitting || imageUploads.some(u => u.isUploading)}
      >
        {isSubmitting ? 'Enviando...' : 'Enviar reseña'}
      </Button>
    </div>
  </div>
</div>
