"use client";

import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules"

export default function CommunityPhotosCarousel({ photos }: { photos: any[] }) {
    if (!photos || photos.length === 0) return null

    return (
        <div className="w-full max-w-full">
            <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={10}
                navigation
                pagination={{ clickable: true }}

                // 👇 breakpoints: controla cuántas fotos se ven en pantalla
                breakpoints={{
                    320: { slidesPerView: 1 },   // mobile chico
                    480: { slidesPerView: 2 },   // mobile grande
                    768: { slidesPerView: 3 },   // tablet
                    1024: { slidesPerView: 3 },  // desktop
                    1280: { slidesPerView: 4 },  // desktop grande (máximo visible)
                }}
            >
                {photos.map((photo) => (
                    <SwiperSlide key={photo.id || photo.image_url}>
                        <div className="relative w-full h-40 rounded-lg overflow-hidden">
                            <Image
                                src={photo.image_url}
                                alt="Community photo"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    )
}