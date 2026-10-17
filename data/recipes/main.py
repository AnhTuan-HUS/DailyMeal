#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DAILYMEAL - END-TO-END RECIPE PIPELINE ORCHESTRATOR

Mục đích:
Điều phối toàn bộ chu trình xử lý dữ liệu món ăn theo 2 bước khép kín:
  - BƯỚC 1: THU THẬP (Crawl dữ liệu thô -> lưu vào data/recipes/raw/ + cập nhật raw/catalog.json)
  - BƯỚC 2: XỬ LÝ (Khử lặp L1 & L2, bẻ về 1 suất ăn -> lưu vào data/recipes/processed/ + cập nhật processed/catalog.json)

Hỗ trợ:
- Chạy toàn bộ pipeline tự động nối tiếp nhau.
- Chạy riêng từng bước độc lập (--crawl-only, --process-only).
- Tự động bỏ qua các món đã xử lý (chế độ tăng dần - Incremental Mode).
"""

import os
import sys
import time
import argparse
from pathlib import Path

# Đảm bảo import được các module trong cùng thư mục dù chạy từ bất kỳ đâu
SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from crawl_data import CookpadLargeScaleCrawler
from process_recipes import RecipePipeline


def print_banner(title: str, char: str = "="):
    line = char * 75
    print(f"\n{line}")
    print(f"📌 {title.center(71)}")
    print(f"{line}\n")


def run_crawl_step(target: int, workers: int, pages: int, methods: list[str] | None):
    """BƯỚC 1: Thu thập dữ liệu từ Cookpad và lưu vào raw/"""
    print_banner("BƯỚC 1: THU THẬP DỮ LIỆU THÔ (CRAWL DATA -> RAW)")
    print(
        f"⚙️  Cấu hình: Target={target}/nhóm | Workers={workers} luồng | Max Pages={pages}"
    )
    if methods:
        print(f"🎯 Nhóm phương pháp chỉ định: {', '.join(methods)}")

    start_time = time.time()
    crawler = CookpadLargeScaleCrawler(target_per_method=target, max_workers=workers)

    try:
        crawler.run(selected_methods=methods, max_pages_per_keyword=pages)
    except KeyboardInterrupt:
        print(
            "\n[!] Đã nhận tín hiệu dừng từ bàn phím (Ctrl+C). Lưu trạng thái hoàn tất."
        )

    elapsed = time.time() - start_time
    total_raw = crawler.storage.get_total_count()
    print(f"\n✅ Hoàn thành Bước 1 trong {elapsed:.1f} giây.")
    print(f"📂 Tổng số công thức thô hiện có: {total_raw} món")
    print(f"📋 Mục lục raw: data/recipes/raw/catalog.json")


def run_process_step(force: bool, similarity: float):
    """BƯỚC 2: Khử lặp và chuẩn hóa về 1 suất ăn, lưu vào processed/"""
    print_banner("BƯỚC 2: XỬ LÝ DỮ LIỆU & CHUẨN HÓA 1 SUẤT (PROCESS -> PROCESSED)")
    print(
        f"⚙️  Cấu hình: Ngưỡng tương đồng={similarity * 100}% | Chế độ={'GHI ĐÈ TOÀN BỘ (--force)' if force else 'TĂNG DẦN (Chỉ món mới)'}"
    )

    start_time = time.time()
    pipeline = RecipePipeline()
    pipeline.run(force_all=force)

    elapsed = time.time() - start_time
    print(f"\n✅ Hoàn thành Bước 2 trong {elapsed:.1f} giây.")
    print(f"💾 Dữ liệu chuẩn đã lưu tại: data/recipes/processed/<cooking_method>/")
    print(f"📋 Mục lục processed: data/recipes/processed/catalog.json")


def main():
    parser = argparse.ArgumentParser(
        description="DailyMeal Recipe End-to-End Pipeline (Crawl -> Process)",
        formatter_class=argparse.RawTextHelpFormatter,
    )

    # Lựa chọn bước chạy
    mode_group = parser.add_argument_group("Chế độ thực thi")
    mode_group.add_argument(
        "--all",
        action="store_true",
        default=True,
        help="Chạy toàn bộ quy trình: Thu thập -> Xử lý chuẩn hóa (Mặc định)",
    )
    mode_group.add_argument(
        "--crawl-only",
        action="store_true",
        help="Chỉ chạy Bước 1: Thu thập dữ liệu vào raw/",
    )
    mode_group.add_argument(
        "--process-only",
        action="store_true",
        help="Chỉ chạy Bước 2: Xử lý dữ liệu từ raw/ sang processed/",
    )

    # Cấu hình Bước 1: Thu thập
    crawl_group = parser.add_argument_group("Cấu hình Bước 1 (Crawl)")
    crawl_group.add_argument(
        "--target",
        type=int,
        default=500,
        help="Số công thức mục tiêu cho mỗi phương pháp nấu (mặc định: 500)",
    )
    crawl_group.add_argument(
        "--workers", type=int, default=4, help="Số luồng cào song song (mặc định: 4)"
    )
    crawl_group.add_argument(
        "--pages",
        type=int,
        default=5,
        help="Số trang tìm kiếm tối đa cho mỗi từ khóa (mặc định: 5)",
    )
    crawl_group.add_argument(
        "--methods",
        nargs="+",
        default=None,
        help="Chỉ định phương pháp nấu cần cào (ví dụ: --methods braised pan_fried)",
    )

    # Cấu hình Bước 2: Xử lý
    process_group = parser.add_argument_group("Cấu hình Bước 2 (Process)")
    process_group.add_argument(
        "--force",
        action="store_true",
        help="Ép buộc xử lý lại toàn bộ file thô (mặc định: chỉ xử lý món mới chưa từng xử lý)",
    )
    process_group.add_argument(
        "--similarity",
        type=float,
        default=0.85,
        help="Ngưỡng tương đồng chuỗi để khử lặp mờ (mặc định: 0.85)",
    )

    args = parser.parse_args()

    overall_start = time.time()
    print_banner("HỆ THỐNG PIPELINE DỮ LIỆU MÓN ĂN: DAILYMEAL / SMARTKITCHEN", char="*")

    # Xác định luồng thực thi
    do_crawl = True
    do_process = True

    if args.crawl_only:
        do_crawl = True
        do_process = False
    elif args.process_only:
        do_crawl = False
        do_process = True

    # Thực thi tuần tự
    if do_crawl:
        run_crawl_step(
            target=args.target,
            workers=args.workers,
            pages=args.pages,
            methods=args.methods,
        )

    if do_process:
        run_process_step(force=args.force, similarity=args.similarity)

    total_time = time.time() - overall_start
    print_banner(
        f"🎉 TOÀN BỘ PIPELINE ĐÃ HOÀN TẤT THÀNH CÔNG TRONG {total_time:.1f} GIÂY!",
        char="*",
    )


if __name__ == "__main__":
    main()
