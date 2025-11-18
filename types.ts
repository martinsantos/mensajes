export interface Tropo {
  id: number;
  nombre: string;
  slug: string;
  color: string;
}

export interface Noticia {
  id: number;
  titulo: string;
  slug: string;
  bajada: string;
  cuerpo: string;
  imagen_url: string;
  is_image_external: boolean;
  tropo_id: number;
  timestamp: string;
  publishDate?: string;
  estado: 'borrador' | 'publicada';
  author?: string;
}

export interface RecentlyViewedArticle {
  slug: string;
  tropoSlug: string;
  title: string;
}
