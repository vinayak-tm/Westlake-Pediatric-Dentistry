import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Award,
  Baby,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  HeartHandshake,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Phone,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Users,
  X,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const heroImage = 'https://images.pexels.com/photos/8260438/pexels-photo-8260438.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const clinicImage = 'https://images.pexels.com/photos/12917374/pexels-photo-12917374.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const teamImage = 'https://images.pexels.com/photos/8260441/pexels-photo-8260441.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

type Page = 'home' | 'about' | 'services' | 'reviews' | 'insurance' | 'booking' | 'admin';
type Appointment = {
  id?: string;
  parent_name: string;
  email: string;
  phone: string;
  child_name: string;
  visit_type: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  created_at?: string;
};

const testimonials = [
  { quote: 'The whole experience felt calm, personal, and genuinely joyful. My daughter asks when she can go back to see Dr. Alzayat.', name: 'Emily R.', detail: 'Mom of a 5-year-old · New patient', initials: 'ER' },
  { quote: 'They took the time to explain everything in a way my son understood. The team made his first visit feel like an adventure.', name: 'Marcus T.', detail: 'Dad of a 7-year-old · Preventive care', initials: 'MT' },
  { quote: 'Beautiful office, thoughtful people, and no pressure. We finally found a dental home our entire family trusts.', name: 'Sarah K.', detail: 'Mom of two · Existing patient', initials: 'SK' },
  { quote: 'From the easy online booking to the follow-up call, every detail was handled with care. Truly exceptional pediatric dentistry.', name: 'Nina P.', detail: 'Mom of a 3-year-old · New patient', initials: 'NP' },
  { quote: 'Dr. Snodell is patient, warm, and incredibly thorough. Our daughter left proud of her sparkling smile.', name: 'David L.', detail: 'Dad of a 9-year-old · Orthodontic consult', initials: 'DL' },
  { quote: 'The sensory-friendly touches made a world of difference for our child. We felt seen from the moment we walked in.', name: 'Rachel M.', detail: 'Mom of a 6-year-old · Special care', initials: 'RM' },
];

const services = [
  { icon: Sparkles, title: 'Growing smiles', text: 'Gentle cleanings, fluoride, sealants, and guidance that make healthy habits feel easy.' },
  { icon: ShieldCheck, title: 'Comfort-first care', text: 'Modern, sensory-aware visits designed around your child’s pace, questions, and confidence.' },
  { icon: Stethoscope, title: 'Complete pediatric care', text: 'From first visits to restorative care, we are here for every stage of your child’s smile.' },
];

const carriers = ['Delta Dental', 'Cigna', 'MetLife', 'Guardian'];
const visitTypes = ['New patient exam', 'Cleaning & check-up', 'Tooth concern', 'Orthodontic consultation'];
const slots = ['8:00 AM', '9:30 AM', '11:00 AM', '1:30 PM', '3:00 PM', '4:30 PM'];

function App() {
  const [page, setPage] = useState<Page>(() => (window.location.hash.replace('#/', '') as Page) || 'home');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(page === 'booking');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const handleHash = () => {
      const next = (window.location.hash.replace('#/', '') as Page) || 'home';
      setPage(next);
      setBookingOpen(next === 'booking');
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    const loadAppointments = async () => {
      if (supabase) {
        const { data } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
        if (data) setAppointments(data as Appointment[]);
      } else {
        const saved = window.localStorage.getItem('westlake-appointments');
        if (saved) setAppointments(JSON.parse(saved) as Appointment[]);
      }
    };
    void loadAppointments();
  }, []);

  const navigate = (nextPage: Page) => {
    window.location.hash = `/${nextPage}`;
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openBooking = () => {
    setBookingOpen(true);
    navigate('booking');
  };

  const saveAppointment = async (appointment: Appointment) => {
    if (supabase) {
      const { data, error } = await supabase.from('appointments').insert(appointment).select().maybeSingle();
      if (error) throw error;
      if (data) setAppointments((current) => [data as Appointment, ...current]);
    } else {
      const saved = { ...appointment, id: crypto.randomUUID(), created_at: new Date().toISOString() };
      const next = [saved, ...appointments];
      setAppointments(next);
      window.localStorage.setItem('westlake-appointments', JSON.stringify(next));
    }
    setToast('Your visit request is in. We’ll confirm your time shortly.');
    setBookingOpen(false);
    navigate('home');
  };

  return (
    <div className="min-h-screen bg-[#fbfdfc] text-[#142c3f]">
      <AnnouncementBar />
      <Header mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} navigate={navigate} openBooking={openBooking} />
      {page === 'home' && <Home navigate={navigate} openBooking={openBooking} />}
      {page === 'about' && <About openBooking={openBooking} />}
      {page === 'services' && <Services openBooking={openBooking} />}
      {page === 'reviews' && <Reviews openBooking={openBooking} />}
      {page === 'insurance' && <Insurance openBooking={openBooking} />}
      {page === 'booking' && <Booking onSubmit={saveAppointment} />}
      {page === 'admin' && <Admin appointments={appointments} />}
      {bookingOpen && page !== 'booking' && <BookingModal close={() => { setBookingOpen(false); navigate(page); }} onSubmit={saveAppointment} />}
      <Footer navigate={navigate} />
      {toast && <Toast message={toast} close={() => setToast('')} />}
    </div>
  );
}

function AnnouncementBar() {
  return <div className="bg-[#0d3447] px-5 py-2.5 text-center text-[11px] font-semibold tracking-[0.13em] text-white/90">NOW WELCOMING NEW FAMILIES <span className="mx-2 text-[#76d5c2]">·</span> VIRTUAL TOUR AVAILABLE <span className="mx-2 text-[#76d5c2]">·</span> <a href="tel:5125550148" className="underline underline-offset-2">(512) 555-0148</a></div>;
}

function Header({ mobileMenu, setMobileMenu, navigate, openBooking }: { mobileMenu: boolean; setMobileMenu: (value: boolean) => void; navigate: (page: Page) => void; openBooking: () => void }) {
  const links: { label: string; page: Page }[] = [{ label: 'Our practice', page: 'about' }, { label: 'Care for kids', page: 'services' }, { label: 'Parent stories', page: 'reviews' }, { label: 'Insurance & fees', page: 'insurance' }];
  return <header className="sticky top-0 z-40 border-b border-[#dceae7] bg-[#fbfdfc]/95 backdrop-blur-md">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
      <button onClick={() => navigate('home')} className="group flex items-center gap-3 text-left" aria-label="Westlake Pediatric Dentistry home">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#dff7f0] text-[#087e77] transition-transform group-hover:rotate-6"><Baby size={23} strokeWidth={1.8} /></span>
        <span><strong className="block font-serif text-[17px] leading-none tracking-tight text-[#0d3447]">Westlake</strong><span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.2em] text-[#087e77]">Pediatric Dentistry</span></span>
      </button>
      <nav className="hidden items-center gap-7 lg:flex">{links.map((link) => <button key={link.page} onClick={() => navigate(link.page)} className="nav-link">{link.label}</button>)}</nav>
      <div className="hidden items-center gap-3 lg:flex"><a href="tel:5125550148" className="flex items-center gap-2 px-2 text-sm font-semibold text-[#0d3447]"><Phone size={16} className="text-[#087e77]" /> (512) 555-0148</a><button onClick={openBooking} className="button-primary">Book a visit <ArrowRight size={16} /></button></div>
      <button className="rounded-xl p-2 lg:hidden" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">{mobileMenu ? <X /> : <Menu />}</button>
    </div>
    {mobileMenu && <div className="border-t border-[#dceae7] bg-white px-5 pb-5 lg:hidden"><nav className="flex flex-col gap-1 pt-3">{links.map((link) => <button key={link.page} onClick={() => navigate(link.page)} className="rounded-xl px-3 py-3 text-left font-medium hover:bg-[#f0faf7]">{link.label}</button>)}<button onClick={openBooking} className="button-primary mt-3 justify-center">Book a visit <ArrowRight size={16} /></button></nav></div>}
  </header>;
}

function Home({ navigate, openBooking }: { navigate: (page: Page) => void; openBooking: () => void }) {
  return <main>
    <section className="hero-wrap"><div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:py-20">
      <div className="animate-fade-up"><div className="eyebrow"><span className="dot" /> A brighter kind of dental visit</div><h1 className="display mt-5 max-w-xl">Big care for <em>little smiles.</em></h1><p className="mt-6 max-w-lg text-lg leading-8 text-[#4b6672]">A modern pediatric dental home where curiosity is celebrated, comfort comes first, and every child leaves feeling proud.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><button onClick={openBooking} className="button-primary justify-center">Find your child’s time <ArrowRight size={17} /></button><button onClick={() => navigate('about')} className="button-secondary justify-center">Meet our doctors <Users size={17} /></button></div><div className="mt-9 flex items-center gap-3 text-sm text-[#45606b]"><div className="flex -space-x-2">{['ER', 'MT', 'SK', 'NP'].map((initial) => <span key={initial} className="avatar">{initial}</span>)}</div><div><div className="flex items-center gap-1 text-[#f0a83a]">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={13} fill="currentColor" />)}</div><span><strong className="text-[#142c3f]">4.9/5</strong> from Austin families</span></div></div></div>
      <div className="relative animate-fade-up [animation-delay:120ms]"><div className="hero-image"><img src={heroImage} alt="Happy child enjoying a dental visit" /><div className="image-wash" /></div><div className="floating-card floating-card-top"><span className="icon-bubble"><Sparkles size={17} /></span><span><strong>Comfort, always</strong><small>Designed for growing humans</small></span></div><div className="floating-card floating-card-bottom"><span className="check-circle"><Check size={17} /></span><span><strong>Now welcoming new families</strong><small>Westlake · Austin, TX</small></span></div></div>
    </div></section>
    <TrustStrip />
    <section className="section-pad"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="section-heading"><div><div className="eyebrow">Care that feels different</div><h2 className="heading mt-3">Everything your family<br /><em>needs to feel at ease.</em></h2></div><p className="max-w-sm text-[15px] leading-7 text-[#55717b]">We pair clinical expertise with the little details that turn dental visits into something kids can look forward to.</p></div><div className="mt-12 grid gap-5 md:grid-cols-3">{services.map(({ icon: Icon, title, text }) => <div key={title} className="feature-card"><span className="service-icon"><Icon size={22} /></span><h3 className="mt-7 text-xl font-semibold text-[#0d3447]">{title}</h3><p className="mt-3 text-[15px] leading-7 text-[#607982]">{text}</p><button onClick={() => navigate('services')} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#087e77]">Explore care <ArrowRight size={15} /></button></div>)}</div></div></section>
    <section className="sage-section"><div className="mx-auto grid max-w-7xl items-center gap-10 px-5 lg:grid-cols-[.85fr_1.15fr] lg:px-8"><div className="overflow-hidden rounded-[28px]"><img src={clinicImage} alt="Child and dentist smiling together" className="h-[390px] w-full object-cover" /></div><div className="lg:pl-8"><div className="eyebrow">Made for childhood</div><h2 className="heading mt-3">A little more<br /><em>magic in medicine.</em></h2><p className="mt-5 max-w-lg leading-8 text-[#55717b]">From the first hello to the high-five goodbye, our space and our team are built to help kids feel safe, understood, and celebrated.</p><div className="mt-7 grid grid-cols-2 gap-5 border-t border-[#bddbd2] pt-6"><div><strong className="stat">15+</strong><span className="stat-label">years caring for kids</span></div><div><strong className="stat">2</strong><span className="stat-label">specialist doctors</span></div></div><button onClick={() => navigate('about')} className="button-secondary mt-8">Step inside our practice <ArrowRight size={16} /></button></div></div></section>
    <ReviewsPreview navigate={navigate} />
    <CTA openBooking={openBooking} />
  </main>;
}

function TrustStrip() { return <section className="border-y border-[#e0ece9] bg-white"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-5 px-5 py-7 md:grid-cols-4 lg:px-8">{[{ icon: HeartHandshake, label: 'Gentle by design' }, { icon: Award, label: 'Board-certified care' }, { icon: ShieldCheck, label: 'Trusted by families' }, { icon: Clock3, label: 'Easy online booking' }].map(({ icon: Icon, label }) => <div key={label} className="flex items-center justify-center gap-3 text-sm font-semibold text-[#40616b]"><Icon size={20} className="text-[#0d9b8e]" />{label}</div>)}</div></section>; }

function ReviewsPreview({ navigate }: { navigate: (page: Page) => void }) { const [active, setActive] = useState(0); const visible = testimonials.slice(active, active + 3); return <section className="section-pad bg-[#fffdf9]"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="section-heading"><div><div className="eyebrow">Parent stories</div><h2 className="heading mt-3">The best part is<br /><em>hearing from you.</em></h2></div><button onClick={() => navigate('reviews')} className="button-secondary hidden sm:flex">Read all stories <ArrowRight size={16} /></button></div><div className="mt-12 grid gap-5 md:grid-cols-3">{visible.map((review) => <ReviewCard key={review.name} review={review} />)}</div><div className="mt-8 flex items-center justify-between"><div className="flex gap-2">{[0, 1, 2, 3].map((item) => <button key={item} onClick={() => setActive(item)} className={`h-2 rounded-full transition-all ${active === item ? 'w-8 bg-[#087e77]' : 'w-2 bg-[#c4ddd6]'}`} aria-label={`Show reviews ${item + 1}`} />)}</div><div className="flex gap-2"><button onClick={() => setActive(Math.max(active - 1, 0))} className="circle-button" aria-label="Previous reviews"><ChevronLeft size={18} /></button><button onClick={() => setActive(Math.min(active + 1, 3))} className="circle-button" aria-label="Next reviews"><ChevronRight size={18} /></button></div></div></div></section>; }

function ReviewCard({ review }: { review: typeof testimonials[number] }) { return <article className="review-card"><div className="flex items-center justify-between"><div className="flex gap-1 text-[#f2ae3d]">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={15} fill="currentColor" />)}</div><BadgeCheck size={18} className="text-[#0aa491]" /></div><p className="mt-6 min-h-[105px] text-[15px] leading-7 text-[#46636c]">“{review.quote}”</p><div className="mt-6 flex items-center gap-3 border-t border-[#e6eeeb] pt-5"><span className="avatar large">{review.initials}</span><span><strong className="block text-sm text-[#173a49]">{review.name}</strong><small className="text-xs text-[#7a9298]">{review.detail}</small></span></div></article>; }

function About({ openBooking }: { openBooking: () => void }) { return <main><PageHero eyebrow="Our practice" title={<>Where healthy smiles<br /><em>start with trust.</em></>} text="Meet the people behind the warm welcome, thoughtful care, and confident smiles at Westlake." image={teamImage} /><section className="section-pad"><div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-2 lg:px-8"><div><div className="eyebrow">The Westlake difference</div><h2 className="heading mt-3">Childhood is a big deal.<br /><em>So is their care.</em></h2></div><div className="space-y-5 text-[16px] leading-8 text-[#55717b]"><p>We created Westlake Pediatric Dentistry to be the kind of place we wanted for our own children: clinically excellent, emotionally intelligent, and full of small moments that make a big difference.</p><p>Our doctors take the time to listen, explain, and earn trust. We never rush a question or a first visit. Every recommendation is made with your child’s long-term health and confidence in mind.</p><button onClick={openBooking} className="button-primary mt-3">Meet us for a visit <ArrowRight size={16} /></button></div></div></section><section className="dark-section"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="eyebrow light">Your care team</div><h2 className="heading light mt-3">Good doctors.<br /><em>Great humans.</em></h2><div className="mt-12 grid gap-6 md:grid-cols-2"><DoctorCard name="Dr. Sam Alzayat" role="Pediatric Dentist" image={heroImage} bio="Known for a calm chairside manner and a talent for turning big questions into easy answers." /><DoctorCard name="Dr. Stephen Snodell" role="Pediatric Dentist" image={clinicImage} bio="Brings thoughtful clinical care, a playful spirit, and a passion for helping every child feel capable." /></div></div></section></main>; }

function DoctorCard({ name, role, image, bio }: { name: string; role: string; image: string; bio: string }) { return <article className="doctor-card"><img src={image} alt={name} /><div className="p-6"><div className="text-xs font-bold uppercase tracking-[0.14em] text-[#78d5c4]">{role}</div><h3 className="mt-2 font-serif text-3xl text-white">{name}</h3><p className="mt-3 text-sm leading-6 text-white/65">{bio}</p></div></article>; }

function Services({ openBooking }: { openBooking: () => void }) { return <main><PageHero eyebrow="Care for kids" title={<>A lifetime of healthy<br /><em>habits, made simple.</em></>} text="Thoughtful care for every age and stage, with a little more patience and a lot more fun." image={clinicImage} /><section className="section-pad"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="grid gap-5 md:grid-cols-3">{services.map(({ icon: Icon, title, text }) => <div key={title} className="feature-card tall"><span className="service-icon"><Icon size={24} /></span><h3 className="mt-8 text-2xl font-semibold">{title}</h3><p className="mt-4 leading-7 text-[#607982]">{text}</p><ul className="mt-7 space-y-3 border-t border-[#e1ece9] pt-6 text-sm text-[#47636d]"><li className="flex gap-2"><Check size={16} className="text-[#079d8f]" /> Preventive exams & cleanings</li><li className="flex gap-2"><Check size={16} className="text-[#079d8f]" /> Parent-friendly education</li><li className="flex gap-2"><Check size={16} className="text-[#079d8f]" /> Personalized care plans</li></ul></div>)}</div><div className="mt-16 rounded-[28px] bg-[#e5f7f1] p-8 text-center md:p-12"><div className="mx-auto max-w-2xl"><div className="eyebrow justify-center">Not sure what they need?</div><h2 className="heading mt-3">Start with a conversation.</h2><p className="mx-auto mt-4 max-w-lg leading-7 text-[#55717b]">We’re happy to help you choose the right first step for your child.</p><button onClick={openBooking} className="button-primary mt-7">Book a visit <ArrowRight size={16} /></button></div></div></div></section></main>; }

function Reviews({ openBooking }: { openBooking: () => void }) { return <main><section className="soft-hero"><div className="mx-auto max-w-3xl px-5 py-20 text-center lg:py-28"><div className="eyebrow justify-center">Parent stories</div><h1 className="display mt-5">A thousand little reasons<br /><em>to smile.</em></h1><p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#55717b]">Real words from families who have made Westlake part of their child’s story.</p><div className="mt-7 flex justify-center gap-1 text-[#eda93c]">{[1, 2, 3, 4, 5].map((star) => <Star key={star} fill="currentColor" size={20} />)}<span className="ml-2 text-sm font-semibold text-[#40616b]">4.9 average rating</span></div></div></section><section className="section-pad"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{testimonials.map((review) => <ReviewCard key={review.name} review={review} />)}</div><div className="mt-14 text-center"><button onClick={openBooking} className="button-primary">Start your own story <ArrowRight size={16} /></button></div></div></section></main>; }

function Insurance({ openBooking }: { openBooking: () => void }) { return <main><PageHero eyebrow="Insurance & fees" title={<>Clear answers.<br /><em>No surprises.</em></>} text="We make it easy to understand your options before your child ever sits in the chair." image={heroImage} /><section className="section-pad"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr]"><div><div className="eyebrow">Accepted insurance</div><h2 className="heading mt-3">Using your benefits<br /><em>should feel easy.</em></h2><p className="mt-5 leading-7 text-[#55717b]">We work with many of Austin’s most trusted plans. Our team verifies benefits and walks you through your estimate before treatment.</p><button onClick={openBooking} className="button-secondary mt-7">Ask about your plan <ArrowRight size={16} /></button></div><div className="grid grid-cols-2 gap-4">{carriers.map((carrier) => <div key={carrier} className="insurance-badge"><ShieldCheck size={24} className="text-[#079d8f]" /><strong>{carrier}</strong><small>In-network partner</small></div>)}</div></div><div className="mt-20 border-t border-[#dfece8] pt-14"><div className="eyebrow">Simple starting fees</div><h2 className="heading mt-3">Know the range<br /><em>before you arrive.</em></h2><div className="mt-10 grid gap-4 md:grid-cols-3"><PriceCard title="First visit" price="$145–$225" text="Exam, gentle cleaning, x-rays when clinically appropriate." /><PriceCard title="Routine visit" price="$115–$185" text="Preventive exam, cleaning, fluoride, and home-care coaching." /><PriceCard title="Easy financing" price="$0 down" text="Ask us about 0% interest payment plans on qualifying care." /></div><p className="mt-6 text-xs leading-5 text-[#718a90]">Starting ranges are estimates and may vary by age, needs, insurance benefits, and treatment complexity. We will always review fees with you first.</p></div></div></section></main>; }

function PriceCard({ title, price, text }: { title: string; price: string; text: string }) { return <div className="price-card"><div className="flex items-center gap-2 text-sm font-bold text-[#087e77]"><CreditCard size={16} /> {title}</div><div className="mt-5 font-serif text-3xl text-[#0d3447]">{price}</div><p className="mt-3 text-sm leading-6 text-[#607982]">{text}</p></div>; }

function PageHero({ eyebrow, title, text, image }: { eyebrow: string; title: React.ReactNode; text: string; image: string }) { return <section className="page-hero"><div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 lg:grid-cols-[1fr_.9fr] lg:px-8 lg:py-20"><div><div className="eyebrow">{eyebrow}</div><h1 className="display mt-5">{title}</h1><p className="mt-6 max-w-lg text-lg leading-8 text-[#55717b]">{text}</p></div><img src={image} alt="Westlake Pediatric Dentistry" className="h-[330px] w-full rounded-[28px] object-cover lg:h-[390px]" /></div></section>; }

function Booking({ onSubmit }: { onSubmit: (appointment: Appointment) => Promise<void> }) { return <main><section className="soft-hero"><div className="mx-auto max-w-4xl px-5 py-14 lg:py-20"><div className="text-center"><div className="eyebrow justify-center">Your easiest next step</div><h1 className="display mt-5">Find a time that<br /><em>works for your family.</em></h1><p className="mx-auto mt-5 max-w-xl leading-7 text-[#55717b]">Choose a visit type, pick a preferred time, and share a few details. We’ll confirm everything with you.</p></div><div className="mt-12"><BookingForm onSubmit={onSubmit} /></div></div></section></main>; }

function BookingModal({ close, onSubmit }: { close: () => void; onSubmit: (appointment: Appointment) => Promise<void> }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-[#0d3447]/45 p-4 backdrop-blur-sm"><div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-[#fbfdfc] p-6 shadow-2xl md:p-9"><div className="mb-6 flex items-start justify-between"><div><div className="eyebrow">Book a visit</div><h2 className="mt-2 font-serif text-3xl text-[#0d3447]">Let’s find their time.</h2></div><button onClick={close} className="circle-button" aria-label="Close booking"><X size={18} /></button></div><BookingForm onSubmit={onSubmit} /></div></div>; }

function BookingForm({ onSubmit }: { onSubmit: (appointment: Appointment) => Promise<void> }) { const [form, setForm] = useState<Appointment>({ parent_name: '', email: '', phone: '', child_name: '', visit_type: visitTypes[0], preferred_date: '', preferred_time: slots[1], status: 'new' }); const [step, setStep] = useState(1); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const today = new Date().toISOString().split('T')[0]; const update = (field: keyof Appointment, value: string) => setForm((current) => ({ ...current, [field]: value })); const submit = async (event: FormEvent) => { event.preventDefault(); setBusy(true); setError(''); try { await onSubmit(form); } catch { setError('We couldn’t save that request right now. Please call us at (512) 555-0148.'); } finally { setBusy(false); } }; return <form onSubmit={submit} className="booking-panel"><div className="mb-8 flex items-center gap-3"><div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div><div className={`step-line ${step >= 2 ? 'active' : ''}`} /><div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div><div className="text-xs font-semibold text-[#6c858c]">{step === 1 ? 'Choose a visit' : 'Your details'}</div></div>{step === 1 ? <><label className="field-label">What can we help with?<select value={form.visit_type} onChange={(e) => update('visit_type', e.target.value)} className="field-input">{visitTypes.map((type) => <option key={type}>{type}</option>)}</select></label><label className="field-label mt-5">Preferred date<input required min={today} type="date" value={form.preferred_date} onChange={(e) => update('preferred_date', e.target.value)} className="field-input" /></label><div className="mt-5"><span className="field-label">Choose a preferred time</span><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{slots.map((slot) => <button type="button" key={slot} onClick={() => update('preferred_time', slot)} className={`time-slot ${form.preferred_time === slot ? 'selected' : ''}`}><Clock3 size={14} /> {slot}</button>)}</div></div><button type="button" onClick={() => { if (!form.preferred_date) { setError('Please choose a preferred date.'); return; } setError(''); setStep(2); }} className="button-primary mt-8 w-full justify-center">Continue <ArrowRight size={16} /></button></> : <><div className="grid gap-5 sm:grid-cols-2"><label className="field-label">Parent or guardian name<input required value={form.parent_name} onChange={(e) => update('parent_name', e.target.value)} className="field-input" placeholder="Your name" /></label><label className="field-label">Child’s name<input required value={form.child_name} onChange={(e) => update('child_name', e.target.value)} className="field-input" placeholder="Child’s name" /></label><label className="field-label">Email address<input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="field-input" placeholder="you@example.com" /></label><label className="field-label">Phone number<input required type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="field-input" placeholder="(512) 555-0148" /></label></div><div className="mt-6 rounded-2xl bg-[#eff9f6] p-4 text-sm text-[#47636d]"><div className="flex items-center gap-2 font-semibold text-[#0d766f]"><CalendarDays size={16} /> {form.visit_type} · {form.preferred_date} · {form.preferred_time}</div><p className="mt-1 pl-6 text-xs">We’ll reach out to confirm availability. No payment is required to request a visit.</p></div><div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row"><button type="button" onClick={() => setStep(1)} className="button-secondary flex-1 justify-center"><ChevronLeft size={16} /> Back</button><button disabled={busy} type="submit" className="button-primary flex-1 justify-center">{busy ? 'Sending request…' : 'Request this time'} <ArrowRight size={16} /></button></div></>}{error && <p className="mt-4 text-center text-sm font-semibold text-[#c65b4c]">{error}</p>}<p className="mt-5 text-center text-xs text-[#7b9298]">Prefer to talk? <a className="font-semibold text-[#087e77]" href="tel:5125550148">Call (512) 555-0148</a></p></form>; }

function Admin({ appointments }: { appointments: Appointment[] }) { return <main className="section-pad"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="eyebrow">Practice dashboard</div><h1 className="heading mt-3">Today at Westlake.</h1><p className="mt-3 text-[#607982]">New appointment requests and preferred times in one place.</p></div><div className="rounded-2xl bg-[#e5f7f1] px-5 py-3 text-sm font-semibold text-[#087e77]"><span className="text-2xl font-serif">{appointments.length}</span><span className="ml-2">total requests</span></div></div><div className="mt-10 overflow-hidden rounded-[24px] border border-[#dceae7] bg-white">{appointments.length === 0 ? <div className="p-12 text-center"><CalendarDays className="mx-auto text-[#8fcfc4]" size={34} /><h2 className="mt-4 font-serif text-2xl">No requests yet</h2><p className="mt-2 text-sm text-[#718a90]">New family bookings will appear here instantly.</p></div> : <div className="divide-y divide-[#e5efec]">{appointments.map((appointment, index) => <div key={appointment.id ?? index} className="grid gap-4 p-5 md:grid-cols-[1.1fr_1fr_1fr_auto] md:items-center"><div><div className="font-semibold text-[#173a49]">{appointment.child_name}</div><div className="mt-1 text-sm text-[#718a90]">Parent: {appointment.parent_name}</div></div><div className="text-sm text-[#47636d]"><div className="font-semibold">{appointment.visit_type}</div><div className="mt-1 flex items-center gap-1 text-[#087e77]"><CalendarDays size={14} /> {appointment.preferred_date} · {appointment.preferred_time}</div></div><div className="text-sm text-[#47636d]"><div>{appointment.email}</div><div className="mt-1">{appointment.phone}</div></div><span className="w-fit rounded-full bg-[#e5f7f1] px-3 py-1 text-xs font-bold capitalize text-[#087e77]">{appointment.status}</span></div>)}</div>}</div></div></main>; }

function CTA({ openBooking }: { openBooking: () => void }) { return <section className="cta-section"><div className="mx-auto max-w-3xl px-5 text-center"><div className="eyebrow justify-center light">The next step is easy</div><h2 className="mt-4 font-serif text-4xl leading-tight text-white md:text-5xl">Ready to make their<br /><em>next visit a good one?</em></h2><p className="mx-auto mt-5 max-w-lg leading-7 text-white/70">Join the Westlake family and give your child a dental home they can grow with.</p><button onClick={openBooking} className="button-light mt-8">Book a visit <ArrowRight size={16} /></button></div></section>; }

function Footer({ navigate }: { navigate: (page: Page) => void }) { return <footer className="bg-[#0d3447] text-white"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8"><div><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#dff7f0] text-[#087e77]"><Baby size={21} /></span><span><strong className="block font-serif text-lg">Westlake</strong><small className="text-[9px] font-bold uppercase tracking-[.18em] text-[#79d7c6]">Pediatric Dentistry</small></span></div><p className="mt-5 max-w-xs text-sm leading-6 text-white/60">Thoughtful pediatric dentistry for bright, confident smiles in Westlake and beyond.</p><div className="mt-5 flex gap-3"><a href="https://instagram.com" className="social"><Instagram size={16} /></a><a href="mailto:info@westlakepediatricdentist.com" className="social"><Mail size={16} /></a></div></div><div><h3 className="footer-title">Explore</h3><button onClick={() => navigate('about')} className="footer-link">Our practice</button><button onClick={() => navigate('services')} className="footer-link">Care for kids</button><button onClick={() => navigate('reviews')} className="footer-link">Parent stories</button></div><div><h3 className="footer-title">Visit us</h3><p className="footer-copy"><MapPin size={15} /> 3300 Bee Caves Rd<br />Suite 500 · Austin, TX 78746</p><a className="footer-link mt-3" href="tel:5125550148"><Phone size={15} /> (512) 555-0148</a></div><div><h3 className="footer-title">Hours</h3><p className="footer-copy">Mon–Thu · 8:00–5:00<br />Friday · 8:00–1:00</p><a className="footer-link mt-3" href="mailto:info@westlakepediatricdentist.com"><Mail size={15} /> info@westlakepediatricdentist.com</a></div></div><div className="border-t border-white/10"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-white/45 md:flex-row md:justify-between lg:px-8"><span>© 2026 Westlake Pediatric Dentistry</span><span className="flex items-center gap-3"><button onClick={() => navigate('admin')} className="underline-offset-2 hover:text-white/80 hover:underline">Staff dashboard</button><span>Care that grows with them.</span></span></div></div></footer>; }

function Toast({ message, close }: { message: string; close: () => void }) { useEffect(() => { const timeout = window.setTimeout(close, 5000); return () => window.clearTimeout(timeout); }, [close]); return <div className="fixed bottom-5 left-1/2 z-[60] flex w-[calc(100%-32px)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl bg-[#0d3447] p-4 text-sm font-semibold text-white shadow-2xl"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#8ce0ce] text-[#0d574e]"><Check size={16} /></span>{message}<button onClick={close} className="ml-auto text-white/60 hover:text-white"><X size={16} /></button></div>; }

export default App;
