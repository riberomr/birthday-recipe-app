import type { Metadata } from 'next';
import Link from 'next/link';
import { ChefHat, Heart, Users, ArrowRight, CookingPotIcon, ShieldCheck, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
    title: 'Sobre Nosotros - Recetario La María',
    description: 'Conoce más sobre nuestro proyecto, cómo funciona y cómo cuidamos tu privacidad.',
};

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-12 md:py-20 max-w-6xl">
            {/* Hero Section */}
            <section className="text-center mb-20">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-primary">
                    Más que un Recetario, <span className="text-foreground">una Comunidad Familiar</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Un espacio creado con cariño para compartir, descubrir y guardar esas recetas que hacen especiales nuestros momentos.
                </p>
            </section>

            {/* Our Story Section */}
            <section className="grid md:grid-cols-2 gap-12 items-center mb-24">
                <div className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-xl bg-secondary/30 flex items-center justify-center">
                    <div className="text-center p-8">
                        <ChefHat className="w-24 h-24 text-primary/50 mx-auto mb-4" />
                        <p className="text-muted-foreground italic">"La cocina es el corazón del hogar"</p>
                    </div>
                </div>
                <div>
                    <h2 className="text-3xl font-bold mb-6">Nuestra Historia</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                        <p>
                            Recetario La María nació como un proyecto personal y familiar. La idea era simple: digitalizar ese cuaderno de recetas manchado de aceite y harina que todos tenemos en casa, para que nunca se pierda un buen plato.
                        </p>
                        <p>
                            Lo que empezó como una pequeña herramienta para nosotros, decidimos abrirlo para que cualquiera pueda usarlo. No somos una gran empresa, somos entusiastas de la cocina y la tecnología creando algo útil y bonito.
                        </p>
                        <p>
                            Aquí no encontrarás algoritmos complejos ni anuncios molestos, solo gente compartiendo su amor por la comida.
                        </p>
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section className="mb-24 bg-card/50 rounded-3xl p-8 md:p-12 border border-border/50">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">¿Cómo funciona?</h2>
                    <p className="text-muted-foreground mt-4">Transparencia total sobre lo que puedes hacer.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <Card className="border-none shadow-sm bg-background/60 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Para Visitantes</h3>
                            <p className="text-muted-foreground text-sm">
                                ¡No necesitas cuenta! Puedes explorar todas las recetas públicas, ver ingredientes y pasos de preparación libremente. Creemos que el conocimiento culinario debe ser accesible.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-background/60 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 text-purple-500">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Para Miembros</h3>
                            <p className="text-muted-foreground text-sm">
                                Al iniciar sesión con Google, desbloqueas funciones especiales: guardar tus favoritos, crear tus propias recetas, compartir fotos de tus platos, puntuar y comentar.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-background/60 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-4 text-green-500">
                                <CookingPotIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Tu Espacio</h3>
                            <p className="text-muted-foreground text-sm">
                                Gestiona tu propio recetario digital. Sube tus creaciones y tenlas siempre a mano, ya sea en el móvil mientras cocinas o en el ordenador planificando la semana.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Privacy & Data Section */}
            <section className="mb-24">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">Tu Privacidad y Datos</h2>
                    <p className="text-muted-foreground mt-4">Sin letra chica ni términos legales complicados.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-start">
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Lock className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">¿Qué guardamos?</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Cuando inicias sesión con Google, solo guardamos lo básico para que la app funcione: tu nombre, correo electrónico y foto de perfil. Esto nos permite identificar tus recetas y favoritos. Nada más.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">¿Para qué usamos tus datos?</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Únicamente para que la aplicación funcione. No vendemos datos, no enviamos spam y no compartimos tu información con terceros. Es un proyecto personal sin fines de lucro comercial con tus datos.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-muted/50 p-6 rounded-2xl border border-border/50">
                        <h3 className="font-semibold mb-4">Resumen Técnico</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                <span><strong>Autenticación:</strong> Usamos Google para que no tengas que recordar otra contraseña más.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                <span><strong>Base de Datos:</strong> Tus recetas y perfil se guardan de forma segura en Supabase, una plataforma líder en infraestructura.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                <span><strong>Cookies:</strong> Solo las estrictamente necesarias para mantener tu sesión iniciada. Sin rastreadores publicitarios.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-primary/5 rounded-3xl p-8 md:p-16 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Te animas a cocinar?</h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Explora, inspírate y comparte. La cocina es mejor cuando se hace juntos.
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
