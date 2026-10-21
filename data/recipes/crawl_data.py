import os
import re
import json
import time
import random
import unicodedata
import urllib.request
import urllib.parse
import signal
import sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock

# ==============================================================================
# CẤU HÌNH THƯ MỤC & ĐƯỜNG DẪN
# ==============================================================================

BASE_DIR = Path(__file__).resolve().parent
RAW_DATA_DIR = BASE_DIR / "raw"
CATALOG_FILE = RAW_DATA_DIR / "catalog.json"

COOKPAD_BASE_URL = "https://cookpad.com"
SEARCH_URL_TEMPLATE = "https://cookpad.com/vn/tim-kiem/{keyword}?page={page}"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/119.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
}

# ==============================================================================
# DANH MỤC TỪ KHÓA THEO TÊN THỰC PHẨM & PHƯƠNG PHÁP NẤU CHUẨN
# ==============================================================================

CATEGORY_KEYWORDS = {
    "pan_fried": [
        "gà rán", "gà chiên", "gà chiên xù", "cánh gà chiên nước mắm", "gà chiên giòn",
        "cá rán", "cá chiên giòn", "cá chiên xù", "chả cá rán",
        "thịt rán", "thịt chiên giòn", "sườn rán", "sườn chiên giòn", "ba chỉ chiên",
        "chả lá lốt", "nem rán", "chả rán", "chả giò chiên",
        "tôm chiên", "tôm chiên xù", "mực chiên giòn", "chả mực chiên",
        "trứng rán", "trứng chiên", "trứng cuộn", "trứng chiên thịt băm",
        "đậu rán", "đậu chiên giòn", "đậu phụ chiên sả ớt"
    ],
    "braised": [
        "thịt kho tàu", "thịt kho tiêu", "thịt kho trứng", "thịt ram", "thịt rang cháy cạnh",
        "sườn kho", "sườn rim", "gà kho", "gà kho gừng", "gà kho sả ớt", "gà rang gừng",
        "cá kho", "cá kho tộ", "cá kho riềng", "cá kho tiêu", "cá bống kho", "cá nục kho",
        "tôm rim", "tôm rang", "tôm kho tàu", "trứng kho thịt", "trứng cút kho",
        "đậu kho", "đậu kho nấm", "nấm kho tiêu", "nấm kho gừng"
    ],
    "stir_fried": [
        "bò xào", "bò xào cần tây", "bò xào hành tây", "bò lúc lắc", "bò xào hoa thiên lý",
        "thịt xào", "thịt xào mắm ruốc", "sườn xào chua ngọt", "gà xào sả ớt", "gà xào nấm",
        "mực xào cần tỏi", "mực xào dứa", "tôm xào rau củ", "tôm xào thập cẩm",
        "rau muống xào tỏi", "bắp cải xào", "su su xào", "cải thìa xào nấm",
        "đậu que xào", "mướp xào", "lòng xào dưa"
    ],
    "boiled_soup": [
        "canh sườn", "canh thịt băm", "canh gà", "gà hầm thuốc bắc", "canh chua cá",
        "canh cá", "canh riêu cua", "canh cua mồng tơi", "canh ngao", "canh nghêu",
        "canh hến", "canh tôm", "canh rau ngót", "canh mồng tơi", "canh mướp",
        "canh bí đỏ", "canh khổ qua nhồi thịt", "canh cà chua trứng", "canh đậu phụ rong biển"
    ],
    "boiled_steamed": [
        "gà luộc", "gà hấp lá chanh", "gà hấp sả", "gà hấp muối",
        "thịt luộc", "thịt ba chỉ luộc", "bắp bò luộc", "tai heo luộc", "chân giò luộc",
        "cá hấp", "cá hấp bia", "cá hấp xì dầu", "cá hấp gừng",
        "tôm hấp bia", "tôm hấp sả", "mực hấp gừng", "nghêu hấp sả",
        "trứng hấp", "rau muống luộc", "bắp cải luộc", "rau củ luộc"
    ],
    "grilled": [
        "gà nướng", "gà nướng muối ớt", "gà nướng mật ong", "cánh gà nướng",
        "thịt nướng", "thịt xiên nướng", "sườn nướng", "thịt quay", "ba chỉ nướng",
        "bò nướng", "bò nướng lá lốt", "cá nướng", "cá nướng giấy bạc",
        "tôm nướng muối ớt", "mực nướng sa tế", "vịt quay", "vịt nướng"
    ],
    "stewed": [
        "cá om dưa", "vịt om sấu", "đậu phụ sốt cà chua", "đậu sốt cay",
        "bò sốt vang", "sườn sốt me", "cá sốt cà chua", "thịt viên sốt cà", "chuối đậu om"
    ],
    "tossed_salad": [
        "nộm bò", "gỏi bò", "nộm tai heo", "gỏi tai heo", "gỏi tôm thịt",
        "gỏi gà", "nộm sứa", "nộm hoa chuối", "dưa góp", "nộm dưa chuột", "salad rau xà lách"
    ]
}

COOKING_METHOD_RULES = [
    ("grilled", ["nuong", "nướng", "quay", "airfryer", "noi chien khong dau", "nồi chiên không dầu"]),
    ("braised", ["kho", "rim", "ram", "rang", "to", "tộ", "quet", "quẹt"]),
    ("boiled_soup", ["canh", "ham", "hầm", "sup", "súp", "soup", "tiem", "tiềm", "nau chua", "nấu chua", "rieu", "riêu"]),
    ("boiled_steamed", ["luoc", "luộc", "hap", "hấp", "chan", "chần"]),
    ("stir_fried", ["xao", "xào", "dao", "đảo", "luc lac", "lúc lắc"]),
    ("pan_fried", ["chien", "chiên", "ran", "rán", "ap chao", "áp chảo"]),
    ("stewed", ["om", "sot", "sốt", "sot ca", "sốt cà"]),
    ("tossed_salad", ["nom", "nộm", "goi", "gỏi", "tron", "trộn", "salad", "dua gop", "dưa góp"]),
]

# ==============================================================================
# QUY TẮC LỌC MÓN ĂN (COMBO / ĐƯỜNG DẪN / ĐỊNH LƯỢNG)
# ==============================================================================

# 1. Loại bỏ các bài gom nhiều món (mâm cơm, cơm nhà với, thực đơn...)
MULTI_DISH_PATTERNS = [
    r"\b(cơm nhà|mâm cơm|bữa cơm|thực đơn|menu|set cơm|combo|gợi ý cơm|cơm trưa|cơm tối|bữa tối|bữa trưa|cơm vp|bento)\b",
    r"\b\d+\s*món\b",
    r"\b(món 1|món 2|món canh|món mặn|món xào|món phụ|món chính)\b",
    r"\b(kho|xào|chiên|rán|luộc|hấp|nướng|canh|om|gỏi|nộm)\b.*(?:\bvà\b|\b\+\b|,|&).*\b(canh|kho|xào|chiên|rán|luộc|hấp|nướng|om|gỏi|nộm)\b",
    r"[,+&].*\b(canh|món|rau luộc|canh chua)\b",
]

# 2. Loại bỏ các bài dẫn link sang món khác hoặc thiếu công thức trực tiếp
REFERRAL_PATTERNS = [
    r"xem link", r"link bên dưới", r"link ở dưới", r"link tại",
    r"xem tại link", r"công thức xem tại", r"cách làm xem tại",
    r"công thức ở bài", r"bài viết trước", r"cookpad\.com/vn/cong-thuc",
    r"xem công thức ở", r"tham khảo bài", r"link chi tiết",
    r"công thức đã chia sẻ", r"bài trước", r"đã post", r"đã đăng",
    r"xem bài", r"https?://"
]

# ==============================================================================
# TIỆN ÍCH XỬ LÝ CHUỖI & ĐỊNH LƯỢNG NGUYÊN LIỆU
# ==============================================================================

def remove_accents(text: str) -> str:
    if not text:
        return ""
    s1 = unicodedata.normalize("NFD", str(text))
    s2 = "".join(c for c in s1 if unicodedata.category(c) != "Mn")
    return s2.replace("đ", "d").replace("Đ", "D").lower().strip()

def slugify_key(key: str) -> str:
    clean_k = remove_accents(key)
    clean_k = re.sub(r"[^\w\s-]", "", clean_k)
    return re.sub(r"[\s-]+", "_", clean_k).strip("_")

def detect_cooking_method(title: str, search_key: str = "", default_method: str = "other") -> str:
    """Nhận diện phương pháp nấu cơ bản theo từ khóa xuất hiện trong tiêu đề."""
    title_norm = (title + " " + remove_accents(title)).lower()
    for method, keywords in COOKING_METHOD_RULES:
        for kw in keywords:
            if re.search(r"\b" + re.escape(kw) + r"\b", title_norm):
                return method

    if search_key:
        key_norm = (search_key + " " + remove_accents(search_key)).lower()
        for method, keywords in COOKING_METHOD_RULES:
            for kw in keywords:
                if re.search(r"\b" + re.escape(kw) + r"\b", key_norm):
                    return method

    return default_method

def has_valid_quantity(ingredient: str) -> bool:
    """
    Kiểm tra xem một dòng nguyên liệu có định lượng cụ thể hay không.
    Trả về False nếu chỉ là '1 ít...', 'chút...', 'vài...', 'vừa đủ', không có số đo.
    """
    ing = ingredient.strip().lower()
    # Loại các từ chỉ lượng mơ hồ: '1 ít...', 'chút ít...', 'vài...'
    if re.search(r"^(?:1\s+|một\s+)?(?:ít|chút|chút\s+ít|miếng\s+nhỏ|vài|vừa\s+đủ|tuỳ\s+ý|tùy\s+ý|tuỳ\s+thích|tùy\s+thích|nêm\s+nếm|gia\s+vị)\b", ing):
        return False

    # Tìm chữ số hoặc phân số
    m = re.search(r"(\d+(?:[.,/]\d+)?|[½¼¾⅓⅔⅛⅜⅝⅞])", ing)
    if not m:
        return False

    # Trường hợp số 1 nằm trong cụm '1 ít' hoặc 'một ít' ở giữa chuỗi
    if re.search(r"\b(?:1|một)\s+ít\b", ing):
        cleaned = re.sub(r"\b(?:1|một)\s+ít\b", "", ing)
        return bool(re.search(r"(\d+(?:[.,/]\d+)?|[½¼¾⅓⅔⅛⅜⅝⅞])", cleaned))

    return True

def validate_ingredients_quantity(ingredients: list) -> bool:
    """
    Quy tắc định lượng:
    - Loại bỏ nếu không có bất kỳ định lượng nào (1 ít gà, 1 ít vịt -> LOẠI).
    - Chấp nhận nếu có định lượng rõ ràng cho phần lớn nguyên liệu, chỉ thiếu 1 hoặc 2.
    """
    if not ingredients or len(ingredients) < 2:
        return False

    quantified = sum(1 for ing in ingredients if has_valid_quantity(ing))

    # Tuyệt đối không chấp nhận nếu không có định lượng nào
    if quantified == 0:
        return False

    # Nếu công thức chỉ có 2-3 nguyên liệu, cần ít nhất 1-2 có định lượng
    if len(ingredients) <= 3:
        return quantified >= 1

    # Nếu công thức có từ 4 nguyên liệu trở lên, cần ít nhất 2 nguyên liệu có định lượng
    # và tỷ lệ có định lượng không dưới 30%
    if quantified < 2 or (quantified / len(ingredients)) < 0.3:
        return False

    return True

def extract_step_images(step_obj: dict):
    raw_img = step_obj.get("image")
    if not raw_img:
        return None
    if isinstance(raw_img, str):
        cleaned = raw_img.strip()
        return cleaned if cleaned else None
    if isinstance(raw_img, list):
        cleaned_list = [img.strip() for img in raw_img if isinstance(img, str) and img.strip()]
        if not cleaned_list:
            return None
        return cleaned_list if len(cleaned_list) > 1 else cleaned_list[0]
    return None

def extract_cook_time(html: str, ld_data: dict):
    """
    Trích xuất thời gian nấu:
    1. Ưu tiên từ thẻ mise-icon-time trong HTML.
    2. Fallback từ trường cookTime/totalTime trong ld+json.
    3. Nếu không có thì trả về None (null trong JSON).
    """
    # 1. Tìm icon thời gian trên Cookpad
    m = re.search(r'mise-icon-time.*?</span>\s*<span[^>]*class="[^"]*mise-icon-text[^"]*"[^>]*>([^<]+)</span>', html, re.DOTALL)
    if not m:
        m = re.search(r'mise-icon-time.*?</svg>\s*<span[^>]*class="[^"]*mise-icon-text[^"]*"[^>]*>([^<]+)</span>', html, re.DOTALL)
    if m:
        t = m.group(1).strip()
        if t:
            return t

    # 2. Fallback từ schema JSON-LD
    for k in ["cookTime", "totalTime", "prepTime"]:
        val = ld_data.get(k)
        if val and isinstance(val, str):
            iso_m = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?", val)
            if iso_m:
                h, mins = iso_m.groups()
                parts = []
                if h:
                    parts.append(f"{h} giờ")
                if mins:
                    parts.append(f"{mins} phút")
                if parts:
                    return " ".join(parts)
            return val.strip()

    return None

# ==============================================================================
# TRÌNH QUẢN LÝ DỮ LIỆU & BỘ NHỚ AN TOÀN ĐA LUỒNG
# ==============================================================================

class CrawlerStorage:
    def __init__(self, raw_dir: Path, catalog_file: Path):
        self.raw_dir = raw_dir
        self.catalog_file = catalog_file
        self.lock = Lock()
        self.existing_ids = set()
        self.catalog = {}
        self.dirty_count = 0
        self.method_counts = {m: 0 for m in CATEGORY_KEYWORDS.keys()}
        self.method_counts["other"] = 0
        self._load_initial_state()

    def _load_initial_state(self):
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        if self.catalog_file.exists():
            try:
                with open(self.catalog_file, "r", encoding="utf-8") as f:
                    self.catalog = json.load(f)
                    for rid, meta in self.catalog.items():
                        self.existing_ids.add(str(rid))
                        m = meta.get("cooking_method", "other")
                        self.method_counts[m] = self.method_counts.get(m, 0) + 1
            except Exception:
                self.catalog = {}

        # Quét bổ sung từ filesystem đề phòng file mới lưu chưa kịp vào catalog
        for p in self.raw_dir.rglob("*.json"):
            if p.name != "catalog.json":
                rid = p.stem
                if rid not in self.existing_ids:
                    self.existing_ids.add(rid)
                    method_folder = p.parent.name
                    self.method_counts[method_folder] = self.method_counts.get(method_folder, 0) + 1

    def is_crawled(self, recipe_id: str) -> bool:
        with self.lock:
            return str(recipe_id) in self.existing_ids

    def save_recipe(self, record: dict) -> Path:
        with self.lock:
            rid = str(record["recipe_id"])
            method = record["cooking_method"]

            target_dir = self.raw_dir / method
            target_dir.mkdir(parents=True, exist_ok=True)
            target_file = target_dir / f"{rid}.json"

            with open(target_file, "w", encoding="utf-8") as f:
                json.dump(record, f, ensure_ascii=False, indent=2)

            self.existing_ids.add(rid)
            rel_path = str(target_file.relative_to(BASE_DIR))
            self.catalog[rid] = {
                "title": record["title"],
                "cooking_method": method,
                "path": rel_path,
            }
            self.method_counts[method] = self.method_counts.get(method, 0) + 1
            self.dirty_count += 1

            if self.dirty_count >= 20:
                self._flush_catalog_locked()

            return target_file

    def flush_catalog(self):
        with self.lock:
            self._flush_catalog_locked()

    def _flush_catalog_locked(self):
        try:
            with open(self.catalog_file, "w", encoding="utf-8") as f:
                json.dump(self.catalog, f, ensure_ascii=False, indent=2)
            self.dirty_count = 0
        except Exception as e:
            print(f"[!] Lỗi khi ghi catalog.json: {e}", file=sys.stderr)

    def get_count_for_method(self, method: str) -> int:
        with self.lock:
            return self.method_counts.get(method, 0)

    def get_total_count(self) -> int:
        with self.lock:
            return len(self.existing_ids)

# ==============================================================================
# HÀM TẢI HTTP VÀ BÓC TÁCH SCHEMA
# ==============================================================================

def fetch_html(url: str, retries: int = 3) -> str:
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=12) as resp:
                return resp.read().decode("utf-8", errors="ignore")
        except Exception:
            if attempt == retries:
                return ""
            time.sleep(attempt * 0.8)
    return ""

def is_valid_recipe(title: str, ingredients: list, steps: list) -> bool:
    """
    Kiểm tra chất lượng công thức:
    - Loại bỏ nếu tiêu đề là combo/mâm cơm nhiều món.
    - Loại bỏ nếu nội dung chứa đường dẫn bài khác hoặc dẫn link.
    - Loại bỏ nếu không có bước hướng dẫn hoặc quá sơ sài (< 30 ký tự).
    - Loại bỏ nếu không có bất kỳ định lượng nguyên liệu nào (1 ít gà, 1 ít vịt...).
    """
    if not title:
        return False

    # 1. Kiểm tra tiêu đề combo nhiều món
    for pat in MULTI_DISH_PATTERNS:
        if re.search(pat, title, re.IGNORECASE):
            return False

    # 2. Kiểm tra hướng dẫn nấu
    if not steps or len(steps) == 0:
        return False

    combined_steps = " ".join([s.get("text", "") for s in steps]).strip()
    if len(combined_steps) < 30:
        return False

    # 3. Kiểm tra link chuyển hướng trong steps hoặc ingredients
    combined_all = combined_steps + " " + " ".join(ingredients)
    for pat in REFERRAL_PATTERNS:
        if re.search(pat, combined_all, re.IGNORECASE):
            return False

    # 4. Kiểm tra định lượng nguyên liệu
    if not validate_ingredients_quantity(ingredients):
        return False

    return True

def parse_recipe_from_html(html: str, recipe_id: str, recipe_url: str, search_key: str, default_method: str) -> dict:
    ld_jsons = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL)
    for block in ld_jsons:
        if '"@type":"Recipe"' in block or '"@type": "Recipe"' in block:
            try:
                data = json.loads(block.strip())
            except Exception:
                continue

            title = data.get("name", "").strip()
            if not title:
                continue

            cooking_method = detect_cooking_method(title, search_key, default_method)

            raw_instructions = data.get("recipeInstructions", [])
            steps = []
            for idx, step_item in enumerate(raw_instructions, start=1):
                step_text = step_item.get("text", "").strip() if isinstance(step_item, dict) else str(step_item).strip()
                step_img = extract_step_images(step_item) if isinstance(step_item, dict) else None
                steps.append({
                    "step": idx,
                    "text": step_text,
                    "image": step_img
                })

            ingredients = data.get("recipeIngredient", [])

            # BỘ LỌC CHẤT LƯỢNG: Loại bỏ món lồng nhiều món, dẫn link, thiếu định lượng
            if not is_valid_recipe(title, ingredients, steps):
                return None

            # TRÍCH XUẤT THỜI GIAN NẤU
            cook_time = extract_cook_time(html, data)

            # PHÂN LOẠI VAI TRÒ MÓN ĂN (DISH_TYPE)
            t_lower = title.lower()
            if any(k in t_lower for k in ["canh", "súp", "soup", "cháo", "lẩu", "tiềm"]):
                dish_type = "soup"
            elif any(k in t_lower for k in ["dưa chua", "dưa góp", "cà pháo", "kim chi", "muối chua"]):
                dish_type = "appetizer_condiment"
            elif any(k in t_lower for k in ["chè ", "thạch ", "sinh tố", "tráng miệng"]):
                dish_type = "dessert"
            elif any(k in t_lower for k in ["cơm chiên", "cơm rang", "xôi ", "phở ", "bún"]):
                dish_type = "staple"
            elif cooking_method == "boiled_soup":
                dish_type = "soup"
            else:
                has_meat = any(m in t_lower for m in ["thịt", "sườn", "ba chỉ", "bò", "heo", "lợn", "gà", "vịt", "cá", "tôm", "mực", "chả", "giò", "nem", "trứng"])
                dish_type = "main" if has_meat else "side"

            return {
                "recipe_id": str(recipe_id),
                "dish_type": dish_type,
                "cooking_method": cooking_method,
                "title": title,
                "cook_time": cook_time,
                "servings": data.get("recipeYield"),
                "image": data.get("image"),
                "source_url": recipe_url,
                "ingredients": ingredients,
                "steps": steps,
            }
    return None

# ==============================================================================
# WORKER TASK XỬ LÝ 1 CÔNG THỨC
# ==============================================================================

def process_single_recipe(recipe_id: str, rel_url: str, search_key: str, default_method: str, storage: CrawlerStorage):
    if storage.is_crawled(recipe_id):
        return None

    full_url = COOKPAD_BASE_URL + rel_url.split("?")[0]
    html = fetch_html(full_url)
    if not html:
        return None

    record = parse_recipe_from_html(html, recipe_id, full_url, search_key, default_method)
    if not record:
        return None

    storage.save_recipe(record)
    time.sleep(random.uniform(0.2, 0.5))
    return record

# ==============================================================================
# HỆ THỐNG ĐIỀU PHỐI CRAWLER
# ==============================================================================

class CookpadLargeScaleCrawler:
    def __init__(self, target_per_method: int = 1000, max_workers: int = 4):
        self.target_per_method = target_per_method
        self.max_workers = max_workers
        self.storage = CrawlerStorage(RAW_DATA_DIR, CATALOG_FILE)
        self.stop_requested = False

        signal.signal(signal.SIGINT, self._handle_signal)
        signal.signal(signal.SIGTERM, self._handle_signal)

    def _handle_signal(self, signum, frame):
        print("\n[!] Nhận tín hiệu dừng (Ctrl+C hoặc SIGTERM). Đang lưu trạng thái...", flush=True)
        self.stop_requested = True

    def run(self, selected_methods: list = None, max_pages_per_keyword: int = 10):
        methods_to_crawl = selected_methods or list(CATEGORY_KEYWORDS.keys())
        print("==================================================================")
        print("[*] BẮT ĐẦU CRAWLER MÓN ĂN COOKPAD THEO THỰC PHẨM & PHƯƠNG PHÁP NẤU")
        print(f"[*] Mục tiêu mỗi phương pháp: {self.target_per_method:,} món")
        print(f"[*] Số luồng worker: {self.max_workers}")
        print(f"[*] Giới hạn trang mỗi từ khóa: {max_pages_per_keyword}")
        print(f"[*] Tổng số món hiện có: {self.storage.get_total_count():,} món")
        print("==================================================================", flush=True)

        for method in methods_to_crawl:
            if self.stop_requested:
                break

            current_method_count = self.storage.get_count_for_method(method)
            if current_method_count >= self.target_per_method:
                print(f"[V] Phương pháp '{method}' đã đạt mục tiêu ({current_method_count:,}/{self.target_per_method:,}). Bỏ qua.")
                continue

            print(f"\n>>> [TIẾN HÀNH PHƯƠNG PHÁP]: {method.upper()} (Đã có: {current_method_count:,} / Mục tiêu: {self.target_per_method:,})", flush=True)
            keywords = CATEGORY_KEYWORDS.get(method, [method])

            for keyword in keywords:
                if self.stop_requested:
                    break
                if self.storage.get_count_for_method(method) >= self.target_per_method:
                    break

                self._crawl_keyword(keyword, method, max_pages=max_pages_per_keyword)

        self.storage.flush_catalog()
        print("\n==================================================================")
        print(f"[HOÀN TẤT] Tổng số bản ghi trong CSDL: {self.storage.get_total_count():,}")
        for m, count in self.storage.method_counts.items():
            print(f"  - {m}: {count:,} món")
        print("==================================================================", flush=True)

    def _crawl_keyword(self, keyword: str, method: str, max_pages: int = 10):
        page = 1
        consecutive_empty_pages = 0

        while not self.stop_requested and page <= max_pages:
            if self.storage.get_count_for_method(method) >= self.target_per_method:
                break

            encoded_kw = urllib.parse.quote(keyword)
            search_url = SEARCH_URL_TEMPLATE.format(keyword=encoded_kw, page=page)

            search_html = fetch_html(search_url)
            if not search_html:
                consecutive_empty_pages += 1
                if consecutive_empty_pages >= 3:
                    break
                page += 1
                continue

            matches = re.findall(r'href="(/vn/cong-thuc/(\d+)[^"]*)"', search_html)
            if not matches:
                consecutive_empty_pages += 1
                if consecutive_empty_pages >= 2:
                    break
                page += 1
                continue

            consecutive_empty_pages = 0

            # Lọc các ID chưa cào
            pending_items = []
            seen_in_page = set()
            for rel_url, rid in matches:
                if rid not in seen_in_page and not self.storage.is_crawled(rid):
                    seen_in_page.add(rid)
                    pending_items.append((rid, rel_url))

            if not pending_items:
                page += 1
                continue

            # Xử lý song song cho các công thức chưa cào
            saved_in_batch = 0
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                futures = {
                    executor.submit(process_single_recipe, rid, rel_url, keyword, method, self.storage): rid
                    for rid, rel_url in pending_items
                }
                for f in as_completed(futures):
                    if self.stop_requested:
                        break
                    res = f.result()
                    if res:
                        saved_in_batch += 1

            total_m = self.storage.get_count_for_method(method)
            total_all = self.storage.get_total_count()
            print(
                f"  [{method.upper()}: {total_m:,}/{self.target_per_method:,} | Tổng: {total_all:,}] "
                f"Từ khóa '{keyword}' trang {page}: lưu +{saved_in_batch}/{len(pending_items)} món hợp lệ",
                flush=True
            )

            page += 1
            time.sleep(random.uniform(0.3, 0.7))

# ==============================================================================
# HÀM KHỞI CHẠY
# ==============================================================================

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Cookpad Food-Centric Multi-threaded Crawler")
    parser.add_argument("--target", type=int, default=500, help="Mục tiêu số bản ghi cho mỗi phương pháp nấu (mặc định: 500)")
    parser.add_argument("--workers", type=int, default=4, help="Số luồng cào song song (mặc định: 4)")
    parser.add_argument("--pages", type=int, default=5, help="Số trang tìm kiếm tối đa cho mỗi từ khóa (mặc định: 5)")
    parser.add_argument("--methods", nargs="+", default=None, help="Chỉ định phương pháp nấu cần cào (ví dụ: pan_fried stir_fried)")

    args = parser.parse_args()

    crawler = CookpadLargeScaleCrawler(
        target_per_method=args.target,
        max_workers=args.workers
    )
    crawler.run(selected_methods=args.methods, max_pages_per_keyword=args.pages)
