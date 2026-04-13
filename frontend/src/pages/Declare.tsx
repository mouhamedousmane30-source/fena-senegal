import { useState, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Upload, MapPin, Calendar, Phone, FileText, ArrowLeft, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/Layout';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import PhoneInput from '@/components/PhoneInput';
import axios from 'axios'; // Importé pour les appels API
import { MOCK_ANNOUNCEMENTS } from '@/lib/data';
import { findSimilarAnnouncements, getMatchedMessage } from '@/lib/matching';
import SimilarAnnouncementsSuggestion from '@/components/SimilarAnnouncementsSuggestion';
import type { AnnouncementType, AnnouncementStatus } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { announcementService } from '@/services/announcement.service';

// --- CONFIGURATION CLOUDINARY ---
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/djzvob3xs/image/upload";
const UPLOAD_PRESET = "fen_na_preset";

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

const Declare = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDropRef = useRef<HTMLDivElement>(null);

  // États existants
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<AnnouncementStatus>(
    (searchParams.get('status') as AnnouncementStatus) || 'perdu'
  );
  const [type, setType] = useState<AnnouncementType>('objet');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<string>('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format YYYY-MM-DD pour l'input date
  });
  const [contact, setContact] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Logique de similarité conservée
  const similarAnnouncements = useMemo(() => {
    if (!title.trim() || !description.trim() || !status) return [];
    return findSimilarAnnouncements(
      { title, description, type, status, location: location || 'Dakar' },
      MOCK_ANNOUNCEMENTS, 5, 0.25
    );
  }, [title, description, type, status, location]);

  const handleImageSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 1); // Pour Feñ Na, on commence par 1 image pour simplifier
    
    setImages(newFiles);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreviews([e.target?.result as string]);
    };
    reader.readAsDataURL(newFiles[0]);
  };

  const removeImage = () => {
    setImages([]);
    setImagePreviews([]);
  };

  // --- LA LOGIQUE DE SOUMISSION MISE À JOUR ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner une localisation', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = "";

      // 1. Upload vers Cloudinary
      if (images.length > 0) {
        const imageFormData = new FormData();
        imageFormData.append("file", images[0]);
        imageFormData.append("upload_preset", UPLOAD_PRESET);

        const cloudinaryRes = await axios.post(CLOUDINARY_URL, imageFormData);
        finalImageUrl = cloudinaryRes.data.secure_url;
      }

      // 2. Envoi vers ton Backend Node.js
      const completeData = {
        title,
        description,
        status, // "perdu" ou "trouvé"
        location: location,
        category: (type === 'personne' ? 'personnes' : type === 'objet' ? 'objets' : 'animaux') as 'personnes' | 'objets' | 'animaux' | 'documents' | 'autres',
        images: finalImageUrl ? [finalImageUrl] : [],
        contactInfo: {
          phone: contact,
          preferredContact: 'phone' as 'phone' | 'email'
        },
        coordinates: {
          lat: 0,
          lng: 0
        }
      };

      console.log('Données envoyées au backend:', JSON.stringify(completeData, null, 2));
      await announcementService.createAnnouncement(completeData);

      toast({
        title: 'Annonce créée !',
        description: 'Votre déclaration est en ligne. Yallah na ko feñ !',
      });
      
      navigate('/annonces');
    } catch (err) {
      console.error(err);
      toast({ title: 'Erreur', description: 'Impossible de publier l\'annonce.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-2xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Créer une déclaration</h1>
          <p className="text-muted-foreground">Signalez un objet, une personne ou un animal à Dakar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Statut & Type (Gardé tel quel car ton UI est superbe) */}
          <div className="grid grid-cols-2 gap-3">
             <button type="button" onClick={() => setStatus('perdu')} className={`p-4 rounded-2xl font-semibold transition-all ${status === 'perdu' ? 'bg-lost text-white shadow-lg' : 'bg-muted text-muted-foreground'}`}>🔴 Perdu</button>
             <button type="button" onClick={() => setStatus('trouvé')} className={`p-4 rounded-2xl font-semibold transition-all ${status === 'trouvé' ? 'bg-found text-white shadow-lg' : 'bg-muted text-muted-foreground'}`}>🟢 Trouvé</button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {['personne', 'objet', 'animal'].map((t) => (
              <button key={t} type="button" onClick={() => setType(t as any)} className={`p-3 rounded-2xl text-sm font-medium transition-all ${type === t ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                {t === 'personne' ? '👤' : t === 'objet' ? '📦' : '🐾'} {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre (ex: Sac à dos noir)" className="h-12 rounded-2xl" required />
          
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description détaillée..." className="rounded-2xl min-h-[120px]" required />

          {/* Section Image avec Preview */}
          <div 
            onClick={() => !images.length && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${isDragOver ? 'border-primary bg-primary/5' : 'border-border'}`}
          >
            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleImageSelect(e.target.files)} className="hidden" />
            
            {imagePreviews.length > 0 ? (
              <div className="relative inline-block">
                <img src={imagePreviews[0]} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                <button onClick={(e) => { e.stopPropagation(); removeImage(); }} className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-lg"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-primary mb-2" />
                <p className="font-semibold">Ajouter une photo</p>
                <p className="text-xs text-muted-foreground">Essentiel pour faciliter les retrouvailles</p>
              </div>
            )}
          </div>

          {/* Sélecteur de localisation avec autocomplétion */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Lieu du signalement</label>
            <LocationAutocomplete 
              value={location} 
              onChange={setLocation}
              placeholder="Tapez pour chercher (ex: Dakar, Thiès...)"
              required 
            />
          </div>
          
          {location && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
              <MapPin className="w-4 h-4 text-green-600" />
              <p className="text-sm font-medium text-green-700">📍 {location}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Date du signalement</label>
            <Input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="h-12 rounded-2xl" 
              required 
            />
          </div>
          
          <PhoneInput 
            value={contact} 
            onChange={setContact} 
            placeholder="Numéro WhatsApp" 
            className="h-12"
            required 
          />

          <Button type="submit" disabled={loading} className="w-full bg-primary text-white rounded-2xl py-7 text-lg font-bold">
            {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Envoi en cours...</> : "Publier l'annonce"}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default Declare;