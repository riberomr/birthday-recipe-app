import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Política de Privacidad - Birthday Recipe App',
    description: 'Política de privacidad y manejo de datos.',
};

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
            <div className="mb-12 text-center md:text-left">
                <h1 className="text-4xl font-bold tracking-tight mb-4">Política de Privacidad</h1>
                <p className="text-muted-foreground">Última actualización: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="space-y-12">
                {/* Intro */}
                <section className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed text-foreground/90">
                        En <strong>Recetario La María</strong>, valoramos tu privacidad y estamos comprometidos a proteger tu información personal. Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos tus datos cuando utilizas nuestra aplicación.
                    </p>
                </section>

                {/* Information Collection */}
                <section>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        1. Información que Recopilamos
                    </h2>
                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <p className="text-muted-foreground mb-4">
                            Podemos recopilar los siguientes tipos de información:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                            <li>
                                <span className="font-medium text-foreground">Información de Cuenta:</span> Al registrarte, podemos solicitar tu nombre, correo electrónico y foto de perfil.
                            </li>
                            <li>
                                <span className="font-medium text-foreground">Contenido Generado por el Usuario:</span> Las recetas, comentarios y calificaciones que publiques.
                            </li>
                            <li>
                                <span className="font-medium text-foreground">Datos de Uso:</span> Información sobre cómo interactúas con la aplicación, páginas visitadas y preferencias.
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Data Usage */}
                <section>
                    <h2 className="text-2xl font-bold mb-4">2. Cómo Usamos tus Datos</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                        Utilizamos la información recopilada para proporcionar y mejorar nuestros servicios. Específicamente:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-secondary/20 rounded-lg">
                            <h3 className="font-semibold mb-2">Supabase</h3>
                            <p className="text-sm text-muted-foreground">
                                Utilizamos Supabase como nuestra plataforma de backend para autenticación y almacenamiento de bases de datos. Tus datos se almacenan de forma segura en sus servidores.
                            </p>
                        </div>
                        <div className="p-4 bg-secondary/20 rounded-lg">
                            <h3 className="font-semibold mb-2">Mejora del Servicio</h3>
                            <p className="text-sm text-muted-foreground">
                                Para personalizar tu experiencia, recordar tus recetas favoritas y mejorar la funcionalidad de la aplicación.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Cookies */}
                <section>
                    <h2 className="text-2xl font-bold mb-4">3. Cookies y Tecnologías Similares</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Utilizamos cookies para mantener tu sesión activa y para recordar tus preferencias. No utilizamos cookies para rastreo publicitario intrusivo. Puedes configurar tu navegador para rechazar todas las cookies, pero algunas partes de nuestro servicio podrían no funcionar correctamente.
                    </p>
                </section>

                {/* Third Party */}
                <section>
                    <h2 className="text-2xl font-bold mb-4">4. Servicios de Terceros</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Es posible que utilices servicios de autenticación de terceros (como Google) para iniciar sesión. Estos servicios tienen sus propias políticas de privacidad que rigen cómo manejan tu información.
                    </p>
                </section>

                {/* Contact */}
                <section className="bg-primary/5 border border-primary/10 rounded-2xl p-8 text-center md:text-left md:flex md:items-center md:justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">¿Tienes preguntas?</h2>
                        <p className="text-muted-foreground">
                            Si tienes dudas sobre nuestra política de privacidad, no dudes en contactarnos.
                        </p>
                    </div>
                    <div className="mt-6 md:mt-0 flex-shrink-0">
                        <Link
                            href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contacto@birthdayrecipeapp.com'}`}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        >
                            Contáctanos
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
