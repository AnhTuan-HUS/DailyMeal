import os
import sys
import re
import pandas as pd
from collections import defaultdict

# Bảng ánh xạ TCVN3 (ABC) sang Unicode chuẩn tiếng Việt
TCVN3_MAP = {
    # a, ă, â
    "¸": "á", "µ": "à", "μ": "à", "¶": "ả", "·": "ã", "¹": "ạ",
    "¨": "ă", "¾": "ắ", "»": "ằ", "¼": "ẳ", "½": "ẵ", "Æ": "ặ",
    "©": "â", "Ê": "ấ", "Ç": "ầ", "È": "ẩ", "É": "ẫ", "Ë": "ậ",
    # e, ê
    "Ð": "é", "Ì": "è", "Î": "ẻ", "Ï": "ẽ", "Ñ": "ẹ",
    "ª": "ê", "Õ": "ế", "Ò": "ề", "Ó": "ể", "Ô": "ễ", "Ö": "ệ",
    # i
    "Ý": "í", "×": "ì", "Ø": "ỉ", "Ü": "ĩ", "Þ": "ị",
    # o, ô, ơ
    "ã": "ó", "ó": "ú", "á": "ỏ", "õ": "õ", "ä": "ọ",
    "«": "ô", "è": "ố", "å": "ồ", "æ": "ổ", "ç": "ỗ", "é": "ộ",
    "¬": "ơ", "í": "ớ", "ê": "ờ", "ë": "ở", "ì": "ỡ", "î": "ợ",
    # u, ư
    "ú": "ù", "ñ": "ủ", "ò": "ũ", "ô": "ụ",
    "−": "ư", "ø": "ứ", "ö": "ử", "÷": "ữ", "ù": "ự",
    # y
    "ý": "ý", "ỳ": "ỳ", "ỷ": "ỷ", "ỹ": "ỹ", "ỵ": "ỵ",
    # đ, Đ
    "®": "đ", "§": "Đ",
    # ký tự thay thế đặc biệt trong PDF gốc
    "ß": "ò", "ï": "ù",
}

# 14 Nhóm thực phẩm theo bảng thành phần thực phẩm Việt Nam (BTP 2007)
FOOD_GROUPS = {
    1: "Ngũ cốc và sản phẩm chế biến",
    2: "Khoai củ và sản phẩm chế biến",
    3: "Hạt, quả giàu đạm, béo và sản phẩm chế biến",
    4: "Rau, quả, củ dùng làm rau",
    5: "Quả chín",
    6: "Dầu, mỡ, bơ",
    7: "Thịt và sản phẩm chế biến",
    8: "Thủy sản và sản phẩm chế biến",
    9: "Trứng và sản phẩm chế biến",
    10: "Sữa và sản phẩm chế biến",
    11: "Đồ hộp",
    12: "Đồ ngọt (đường, bánh, mứt, kẹo)",
    13: "Gia vị, nước chấm",
    14: "Nước giải khát, bia, rượu",
}

# Danh sách 45 chỉ tiêu dinh dưỡng cột trái (Left Column)
LEFT_KEYS = [
    "water_g", "energy_kcal", "energy_kj", "protein_g", "fat_g", "carb_g", "fiber_g", "ash_g",
    "sugar_total_g", "galactose_g", "maltose_g", "lactose_g", "fructose_g", "glucose_g", "sucrose_g",
    "calcium_mg", "iron_mg", "magnesium_mg", "manganese_mg", "phosphorus_mg", "potassium_mg",
    "sodium_mg", "zinc_mg", "copper_mcg", "selenium_mcg",
    "vitamin_c_mg", "vitamin_b1_mg", "vitamin_b2_mg", "vitamin_pp_mg", "vitamin_b5_mg", "vitamin_b6_mg",
    "folate_mcg", "vitamin_b9_mcg", "biotin_mcg", "vitamin_b12_mcg", "vitamin_a_mcg", "vitamin_d_mcg",
    "vitamin_e_mg", "vitamin_k_mcg", "beta_carotene_mcg", "alpha_carotene_mcg", "beta_cryptoxanthin_mcg",
    "lycopene_mcg", "lutein_zeaxanthin_mcg", "purin_mg"
]

# Danh sách 45 chỉ tiêu dinh dưỡng cột phải (Right Column)
RIGHT_KEYS = [
    "isoflavone_total_mg", "daidzein_mg", "genistein_mg", "glycetin_mg",
    "saturated_fat_g", None, "palmitic_g", "margaric_g", "stearic_g", "arachidic_g",
    "behenic_g", "lignoceric_g", "monounsaturated_fat_g", None, "myristoleic_g",
    "palmitoleic_g", "oleic_g", "polyunsaturated_fat_g", None, "linoleic_g",
    "linolenic_g", "arachidonic_g", "epa_g", "dha_g", "trans_fat_g",
    "cholesterol_mg", "phytosterol_mg",
    "lysin_mg", "methionin_mg", "tryptophan_mg", "phenylalanin_mg", "threonin_mg",
    "valin_mg", "leucin_mg", "isoleucin_mg", "arginin_mg", "histidin_mg", "cystin_mg",
    "tyrosin_mg", "alanin_mg", "aspartic_acid_mg", "glutamic_acid_mg", "glycin_mg",
    "prolin_mg", "serin_mg"
]


def tcvn3_to_unicode(text):
    """Chuyển đổi chuỗi ký tự mã TCVN3 (ABC) sang bảng mã Unicode dựng sẵn chuẩn tiếng Việt."""
    if not text:
        return ""
    converted = "".join(TCVN3_MAP.get(c, c) for c in text)
    return re.sub(r"\s+", " ", converted).strip()


def load_authoritative_names(base_dir):
    """Đọc tên thực phẩm đã chuẩn hóa từ thanh_phan.md nếu có trong thư mục data."""
    names = {}
    path = os.path.join(base_dir, "thanh_phan.md")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                m = re.match(r"\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|", line)
                if m:
                    names[int(m.group(1))] = m.group(2).strip()
    return names


def _group_words_to_row_values(word_list, x_min, x_max):
    """
    Gom cụm các từ theo tọa độ trục Y để lấy giá trị số/chuỗi tại cột giá trị.
    Loại bỏ các ký tự in bóng/trùng lặp thường gặp trong file PDF gốc.
    """
    rows = defaultdict(list)
    for w in sorted(word_list, key=lambda x: (x[1], x[0])):
        matched_y = None
        for yk in rows:
            if abs(w[1] - yk) < 5:
                matched_y = yk
                break
        if matched_y is None:
            matched_y = w[1]
        rows[matched_y].append(w)

    values = []
    for y in sorted(rows):
        ws = rows[y]
        val_words = [w[4] for w in ws if x_min <= w[0] < x_max]
        val_str = " ".join(val_words).strip()
        val = val_str.split()[0] if val_str else "-"
        values.append(val)
    return values


def _parse_page_words(words, authoritative_names):
    """
    Trích xuất dữ liệu của 1 trang thực phẩm dựa trên tọa độ chính xác:
    - Tiêu đề & metadata: STT, Mã số, Thải bỏ (%), Tên tiếng Việt, Tên tiếng Anh.
    - 45 chỉ tiêu dinh dưỡng cột trái (x < 300)
    - 45 chỉ tiêu dinh dưỡng cột phải (x > 300)
    """
    header_words = [w for w in words if w[1] < 95]
    if not any("sè" in w[4] or "1001" in w[4] or "M·" in w[4] for w in header_words):
        return None

    # Tọa độ các trường metadata trên header
    stt_words = [w[4] for w in header_words if w[1] <= 53 and w[0] >= 490]
    code_words = [w[4] for w in header_words if 53 < w[1] <= 70 and w[0] >= 490]
    waste_words = [w[4] for w in header_words if 70 < w[1] <= 88 and w[0] >= 490]

    stt_match = re.search(r"\d+", " ".join(stt_words))
    code_match = re.search(r"\d+", " ".join(code_words))
    if not (stt_match and code_match):
        return None

    stt = int(stt_match.group(0))
    code = int(code_match.group(0))

    waste_m = re.search(r"[\d\.\-]+", " ".join(waste_words))
    waste = waste_m.group(0) if waste_m else "-"

    # Tên tiếng Việt và tiếng Anh
    vi_words = [w[4] for w in sorted(header_words, key=lambda x: (x[1], x[0])) if w[1] <= 53 and 170 <= w[0] <= 465]
    en_words = [w[4] for w in sorted(header_words, key=lambda x: (x[1], x[0])) if 53 < w[1] <= 75 and 170 <= w[0] <= 465]

    raw_vi = " ".join(vi_words).strip()
    vi_name = authoritative_names.get(code, tcvn3_to_unicode(raw_vi))

    raw_en = " ".join(en_words).strip()
    clean_en = re.sub(r"(100\s*g|phÇn\s*¨n|edible|portion|Thμnh\s*phÇn).*$", "", raw_en, flags=re.IGNORECASE).strip()
    clean_en = clean_en.rstrip(",").strip()

    group_id = code // 1000
    group_name = FOOD_GROUPS.get(group_id, "")

    item = {
        "stt": stt,
        "code": code,
        "name_vi": vi_name,
        "name_en": clean_en,
        "group_id": group_id,
        "group_name": group_name,
        "waste_rate_percent": waste,
    }

    # Nội dung dinh dưỡng: y từ 118 đến 750
    content_words = [w for w in words if 118 <= w[1] <= 750]
    left_words = [w for w in content_words if w[0] < 300]
    right_words = [w for w in content_words if w[0] > 300]

    # Cột trái: Giá trị tại x từ 222 đến 266
    l_vals = _group_words_to_row_values(left_words, 222, 266)
    # Cột phải: Giá trị tại x từ 469 đến 516
    r_vals = _group_words_to_row_values(right_words, 469, 516)

    for k, v in zip(LEFT_KEYS, l_vals):
        item[k] = v

    for k, v in zip(RIGHT_KEYS, r_vals):
        if k:
            item[k] = v

    return item


def dataframe_to_markdown_fallback(df):
    """Chuyển đổi DataFrame sang Markdown table mà không phụ thuộc vào thư viện tabulate."""
    headers = list(df.columns)
    lines = ["| " + " | ".join(str(h) for h in headers) + " |"]
    lines.append("| " + " | ".join(["---"] * len(headers)) + " |")
    for row in df.itertuples(index=False):
        lines.append("| " + " | ".join(str(v) if (v is not None and v != "") else "-" for v in row) + " |")
    return "\n".join(lines)


def parse_nutrition_pdf(pdf_path, output_md_path):
    """
    Đọc và phân tách toàn bộ 526 nguyên liệu trong Bảng thành phần thực phẩm (BTP 2007).
    Hỗ trợ PyMuPDF (tốc độ cao) và tự động fallback sang pdfplumber nếu cần.
    """
    if not os.path.exists(pdf_path):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        for candidate in ["VTN_FCT_2007.pdf", "nguyên liệu.pdf", "nguyen_lieu.pdf"]:
            cand_path = os.path.join(base_dir, candidate)
            if os.path.exists(cand_path):
                pdf_path = cand_path
                break

    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"Không tìm thấy file PDF tại: {pdf_path}")

    base_dir = os.path.dirname(os.path.abspath(pdf_path))
    authoritative_names = load_authoritative_names(base_dir)

    records = []

    # Thử nghiệm PyMuPDF trước tiên (tốc độ xử lý ~1-2s cho toàn bộ 567 trang)
    try:
        import pymupdf
        use_pymupdf = True
    except ImportError:
        use_pymupdf = False

    if use_pymupdf:
        print(f"Đang phân tích {pdf_path} bằng PyMuPDF...")
        doc = pymupdf.open(pdf_path)
        for page in doc:
            words = page.get_text("words")
            # Định dạng: (x0, y0, x1, y1, text, block_no, line_no, word_no)
            item = _parse_page_words(words, authoritative_names)
            if item:
                records.append(item)
    else:
        print(f"Đang phân tích {pdf_path} bằng pdfplumber...")
        import pdfplumber
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                raw_words = page.extract_words()
                # Chuyển đổi định dạng pdfplumber (x0, top, x1, bottom, text) sang tuple đồng nhất
                words = [(w["x0"], w["top"], w["x1"], w["bottom"], w["text"]) for w in raw_words]
                item = _parse_page_words(words, authoritative_names)
                if item:
                    records.append(item)

    # Sắp xếp theo STT chuẩn
    records.sort(key=lambda x: x["stt"])
    df = pd.DataFrame(records)

    # Xuất ra file Markdown
    os.makedirs(os.path.dirname(os.path.abspath(output_md_path)), exist_ok=True)
    try:
        md_content = df.to_markdown(index=False)
    except Exception:
        md_content = dataframe_to_markdown_fallback(df)

    with open(output_md_path, "w", encoding="utf-8") as f:
        f.write(md_content)

    # Xuất kèm file CSV để thuận tiện tích hợp backend / database
    csv_path = os.path.splitext(output_md_path)[0] + ".csv"
    df.to_csv(csv_path, index=False, encoding="utf-8-sig")

    print(f"Đã phân tách thành công {len(records)} nguyên liệu!")
    print(f"- File Markdown: {output_md_path}")
    print(f"- File CSV: {csv_path}")
    return df


if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)

    # Xác định đường dẫn file đầu vào và đầu ra mặc định
    input_pdf = os.path.join(current_dir, "VTN_FCT_2007.pdf")
    output_md = os.path.join(project_root, "all_526_ingredients.md")

    if len(sys.argv) > 1:
        input_pdf = sys.argv[1]
    if len(sys.argv) > 2:
        output_md = sys.argv[2]

    parse_nutrition_pdf(input_pdf, output_md)
