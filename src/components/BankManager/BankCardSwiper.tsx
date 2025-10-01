import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { Bank } from '../../types/bank';
import { BankCard } from './BankCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

interface BankCardSwiperProps {
  banks: Bank[];
  hiddenBalances: Set<string>;
  onEdit: (bank: Bank) => void;
  onDelete: (bank: Bank) => void;
  onToggleVisibility: (bankId: string) => void;
}

export function BankCardSwiper({
  banks,
  hiddenBalances,
  onEdit,
  onDelete,
  onToggleVisibility,
}: BankCardSwiperProps) {
  return (
    <div className="md:hidden"> {/* This div will only be visible on mobile and hidden on md+ screens */}
      <Swiper
        slidesPerView={1}
        spaceBetween={20}
        pagination={{ clickable: true }}
        modules={[Pagination]}
        className="mySwiper !pb-8" // Add some padding bottom for pagination dots
      >
        {banks.map((bank, index) => (
          <SwiperSlide key={bank.id} className="h-auto"> {/* Ensure slides can adjust height */}
            <BankCard
              bank={bank}
              index={index}
              isBalanceHidden={hiddenBalances.has(bank.id)}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleVisibility={onToggleVisibility}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}