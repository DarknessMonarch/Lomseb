"use client";

import { useState, useRef } from "react";
import styles from "@/app/styles/filter.module.css";
import { IoFilterOutline as FilterIcon } from "react-icons/io5";


export default function Filter({
  options,
  onSelect,
  dropPlaceHolder,
  value,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  const selectedOption = options?.find((opt) => opt.value === value);


  const handleSelect = (option) => {
    onSelect(option.value);
    setIsOpen(false);
  };


  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <div
        className={styles.dropdownInput}
        onClick={() => setIsOpen(!isOpen)}
        ref={triggerRef}
      >
        <FilterIcon
          className={styles.dropdownIcon}
          aria-label="Dropdown icon"
        />
        <span>{selectedOption ? selectedOption.label : dropPlaceHolder}</span>
      </div>
      {isOpen && options && options.length > 0 && (
        <div className={styles.dropdownArea}>
          {options.map((option, index) => (
            <span
              key={option.value || index}
              onClick={() => handleSelect(option)}
              className={option.value === value ? styles.selected : ""}
            >
              {option.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
