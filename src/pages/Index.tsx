import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, BookOpen, Video, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { FilmCard } from "@/components/FilmCard";
import { Header } from "@/components/Header";
import { popularFilms, Film } from "@/data/mockData";

const Index = () => {
  const navigate = useNavigate();

  const handleSelectFilm = (film: Film) => {
    navigate(`/film/${film.id}`);
  };

  return (
    <div className="dark min-h-screen cinema-gradient-radial">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-6 overflow-hidden">
        {/* Ambient glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-4xl mx-auto stagger-children">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Discover the story behind the story
            </span>
          </div>

          {/* Main headline */}
          <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6">
            Deep Dive into
            <span className="block text-primary cinema-text-glow">
              Cinema
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            One search unlocks books, documentaries, analyses, podcasts, and interviews.
            <span className="text-foreground/80"> Everything you need to truly understand a film.</span>
          </p>

          {/* Search Bar */}
          <div className="flex justify-center mb-12">
            <SearchBar onSelectFilm={handleSelectFilm} variant="hero" />
          </div>

          {/* CTA */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="cinema-gold"
              size="xl"
              onClick={() => navigate("/film/1")}
              className="group"
            >
              Explore Blade Runner 2049
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="relative py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              All the context, <span className="text-primary">one place</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Stop searching across a dozen platforms. We aggregate everything worth knowing about your favorite films.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: BookOpen,
                title: "Books & Essays",
                description: "Scholarly works, making-of books, and critical essays about films and filmmakers.",
              },
              {
                icon: Video,
                title: "Video Essays",
                description: "The best YouTube analyses, documentaries, and behind-the-scenes content.",
              },
              {
                icon: Headphones,
                title: "Podcasts & Interviews",
                description: "In-depth conversations with directors, actors, and film critics.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="content-card p-6 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Films Section */}
      <section className="relative py-20 px-6">
        <div className="container mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                Popular Deep Dives
              </h2>
              <p className="text-muted-foreground">
                Start exploring with these cinematic favorites
              </p>
            </div>
            <Button variant="cinema-ghost" className="hidden md:flex group">
              View all
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
            {[...popularFilms, ...popularFilms].slice(0, 6).map((film, index) => (
              <FilmCard key={`${film.id}-${index}`} film={film} size="lg" />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-semibold">
                Deep<span className="text-primary">Dive</span>
              </span>
              <span className="text-muted-foreground text-sm">
                — The ultimate film exploration tool
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">About</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
