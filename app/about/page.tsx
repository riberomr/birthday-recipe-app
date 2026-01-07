import type { Metadata } from 'next';
// import Image from 'next/image';

// TODO: Add real chef image, remove placeholder and uncomment Image import
import Link from 'next/link';
import { ChefHat, Heart, Users, ArrowRight, CookingPotIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
    title: 'Sobre Nosotros - Recetario La María',
    description: 'Conoce más sobre nuestra misión y la pasión por la cocina casera.',
};

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-12 md:py-20 max-w-6xl">
            {/* Hero Section */}
            <section className="text-center mb-20">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-primary">
                    Cocina Casera, <span className="text-foreground">Hecha con Amor</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Nuestra misión es hacer que la cocina deliciosa y casera sea accesible para todos, celebrando los sabores que nos unen.
                </p>
            </section>

            {/* Our Story Section */}
            <section className="grid md:grid-cols-2 gap-12 items-center mb-24">
                <div className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-xl">
                    {/* Using a placeholder since we don't have a real chef image yet. 
              In a real scenario, this would be a real image import. */}
                    <div className="absolute inset-0 bg-secondary/30 flex items-center justify-center">
                        <ChefHat className="w-24 h-24 text-primary/50" />
                    </div>
                    {/* If you have an image, uncomment below:
             <Image 
               src="/path/to/chef-image.jpg" 
               alt="El Chef cocinando" 
               fill 
               className="object-cover"
             /> 
             */}
                </div>
                <div>
                    <h2 className="text-3xl font-bold mb-6">Nuestra Historia</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                        <p>
                            Todo comenzó en una pequeña cocina, con un cuaderno de recetas heredado y muchas ganas de experimentar. Lo que empezó como un hobby para documentar los platos favoritos de la familia se ha convertido en este espacio para compartir.
                        </p>
                        <p>
                            Creemos que la comida no es solo combustible, sino una forma de lenguaje. Cada receta cuenta una historia, cada ingrediente tiene un propósito y cada plato compartido es un recuerdo creado.
                        </p>
                        <p>
                            Hoy, este recetario digital busca inspirarte a ti, ya seas un experto culinario o alguien que apenas está aprendiendo a picar cebolla.
                        </p>
                    </div>
                </div>
            </section>

            {/* Why Us Section */}
            <section className="mb-24">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">¿Por qué este blog?</h2>
                    <p className="text-muted-foreground mt-4">Lo que nos hace diferentes y especiales.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-card/50">
                        <CardContent className="pt-6 text-center">
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                                <CookingPotIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Ingredientes Reales</h3>
                            <p className="text-muted-foreground">Priorizamos ingredientes frescos, de temporada y accesibles. Nada de complicaciones innecesarias.</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-card/50">
                        <CardContent className="pt-6 text-center">
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Comunidad</h3>
                            <p className="text-muted-foreground">Más que recetas, somos una comunidad de amantes de la comida que comparten consejos y trucos.</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-card/50">
                        <CardContent className="pt-6 text-center">
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                                <Heart className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Pasión Pura</h3>
                            <p className="text-muted-foreground">Cada receta ha sido probada y aprobada con amor antes de llegar a tu pantalla.</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-primary/5 rounded-3xl p-8 md:p-16 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para cocinar algo delicioso?</h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Explora nuestra colección de recetas y encuentra tu próxima comida favorita.
                </p>
                <Link href="/recipes">
                    <Button size="lg" className="rounded-full px-8 h-12 gap-2 text-base">
                        Ver Recetas <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </section>
        </div>
    );
}
