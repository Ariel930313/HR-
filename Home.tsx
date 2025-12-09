import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  Shield, 
  Sword, 
  BookOpen, 
  CheckCircle, 
  Lock, 
  TrendingUp, 
  Award, 
  X,
  PlayCircle,
  CheckSquare,
  AlertCircle,
  ClipboardList,
  ArrowRight,
  UploadCloud,
  FileSpreadsheet,
  Loader,
  Check,
  Download,
  Youtube,
  Code,
  Timer,
  BrainCircuit,
  Lightbulb,
  RefreshCw 
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Practice {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

interface SkillNode {
  name: string;
  formula: string;
  context: string;
  videoTitle: string;
}

interface Task {
  id: number;
  module: string;
  type?: string;
  title: string;
  scenario?: string;
  desc: string;
  status: 'locked' | 'active' | 'completed';
  xpReward: number;
  badgeReward: string;
  badgeIcon?: string;
  requirements: string[];
  skillNodes: SkillNode[];
  practices?: Practice[];
  downloadFile?: string;
  timeLimit?: number;
  isBoss?: boolean;
}

interface Badge {
  name: string;
  icon: string;
}

interface PlayerState {
  name: string;
  level: number;
  title: string;
  xp: number;
  maxXp: number;
  badges: Badge[];
}

interface AssessmentResult {
  level: string;
  title: string;
  strengths: string[];
  weaknesses: string[];
  recommendedModule: number;
}

const Home = () => {
  // --- 狀態管理 ---
  const { toast } = useToast();
  const [showAssessment, setShowAssessment] = useState(true);
  const [assessmentStage, setAssessmentStage] = useState('intro');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisSteps, setAnalysisSteps] = useState<string[]>([]);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);

  const [modalMode, setModalMode] = useState('info'); 
  const [taskUploadStatus, setTaskUploadStatus] = useState('idle');

  // --- 倒數計時器狀態 ---
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  // --- 測驗狀態 ---
  const [currentQuizAnswers, setCurrentQuizAnswers] = useState<Record<string, number>>({});
  // 移除 quizSubmitted，改用個別題目是否已回答來判斷

  const [playerState, setPlayerState] = useState<PlayerState>({
    name: "Alex",
    level: 1,
    title: "新手實習生",
    xp: 0,
    maxXp: 20,
    badges: []
  });

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  
  // --- 計時器邏輯 ---
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false); 
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft]);

  // 格式化時間 (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 任務清單 (確認所有 Quiz 都有 answer 和 explanation)
  const [tasks, setTasks] = useState<Task[]>([
    // ==========================================
    // Module 1: 考勤與工時
    // ==========================================
    {
      id: 1,
      module: "考勤與工時",
      type: "quiz",
      title: "⭐ 小試身手：考勤觀念快問快答",
      scenario: "【情境：月初暖身】在開始處理龐大的打卡數據前，先確認你對 Excel 時間與日期函數的基本觀念是否正確。",
      desc: "主管：「先考考你幾個基本觀念，確認沒問題再開始做表。」",
      status: "active", // First task active
      xpReward: 15,
      badgeReward: "時間觀念達人",
      requirements: ["回答 NETWORKDAYS 的正確用法", "辨識 TIME 函數的邏輯"],
      skillNodes: [{ name: "觀念檢測", formula: "Quiz Mode", context: "基礎觀念確認", videoTitle: "Excel 日期時間總整理" }],
      practices: [
        {
          id: "p1_1",
          question: "我想計算 2023/10/1 到 2023/10/31 的工作日（扣除六日），該用哪個公式？",
          options: ["=DAYS(2023/10/31, 2023/10/1)", "=NETWORKDAYS(\"2023/10/1\", \"2023/10/31\")", "=2023/10/31 - 2023/10/1"],
          answer: 1,
          explanation: "✅ NETWORKDAYS 函數專門用於計算兩個日期之間的工作日天數，會自動扣除週六與週日。DAYS 僅計算日曆天數差。"
        },
        {
          id: "p1_2",
          question: "如果要判斷 A1 欄位的時間是否晚於 9:00，下列哪個寫法最安全正確？",
          options: ["=IF(A1 > \"9:00\", ...)", "=IF(A1 > 9, ...)", "=IF(A1 > TIME(9,0,0), ...)"],
          answer: 2,
          explanation: "✅ 在 Excel 中，時間是小數點數值。使用 TIME(9,0,0) 能確保生成正確的時間序列值進行比較，避免文字格式造成的判斷錯誤。"
        }
      ]
    },
    {
      id: 2,
      module: "考勤與工時",
      title: "L1. 考勤異常標記練習",
      scenario: "【情境：打卡細節】這次要更精細。除了遲到，還要抓出「早退」跟「未打卡」。請使用複合條件標記所有異常狀態。",
      desc: "考勤專員：「只有遲到還不夠，我要看到所有的異常狀況。」",
      status: "locked",
      xpReward: 15,
      badgeReward: "早鳥守護者",
      downloadFile: "M01_Task_01_Lateness.xlsx",
      timeLimit: 600, 
      requirements: ["使用 OR 函數判斷遲到或早退", "處理空白打卡資料"],
      skillNodes: [{ name: "異常處理", formula: "=IF(OR(A2=\"\", B2>...), \"異常\", \"\")", context: "多重異常判斷", videoTitle: "邏輯函數應用" }]
    },
    {
      id: 3,
      module: "考勤與工時",
      title: "L2. 計算平日與假日加班時數",
      scenario: "【情境：加班費計算】公司政策規定，平日加班超過 2 小時才算數，假日則全額計算。請根據打卡紀錄與日期類型，計算每人的有效加班時數。",
      desc: "薪酬專員：「平日跟假日計算方式不同，小心別算錯了！」",
      status: "locked",
      xpReward: 20,
      badgeReward: "精算師",
      downloadFile: "M01_Task_02_Overtime.xlsx",
      timeLimit: 720,
      requirements: ["使用 WEEKDAY 判斷星期幾", "使用 IF 分流平日/假日邏輯", "計算時數差額"],
      skillNodes: [{ name: "星期判斷", formula: "=WEEKDAY(Serial_number, 2)", context: "判斷週末或平日", videoTitle: "WEEKDAY 函數" }]
    },
    {
      id: 4,
      module: "考勤與工時",
      title: "L3. 統計特休假剩餘天數",
      scenario: "【情境：請假管理】新進員工詢問自己還有幾天假。請依據「到職日」計算年資，對照公司年假表（VLOOKUP），並扣除已休天數。",
      desc: "人資行政：「每個人年資不同，年假天數也不同，請自動化對照。」",
      status: "locked",
      xpReward: 25,
      badgeReward: "假勤管家",
      downloadFile: "M01_Task_03_Leave_Balance.xlsx",
      timeLimit: 900,
      requirements: ["使用 DATEDIF 計算年資", "使用 VLOOKUP 查找年假表", "計算剩餘天數"],
      skillNodes: [{ name: "年資計算", formula: "=DATEDIF(Start, Today, \"Y\")", context: "計算滿幾年", videoTitle: "DATEDIF 隱藏函數" }]
    },
    {
      id: 5,
      module: "考勤與工時",
      title: "L4. 製作缺勤扣款明細表",
      scenario: "【情境：薪資前置】事假與病假扣款比例不同。請製作一份試算表，輸入請假類型與時數後，自動計算應扣薪資。",
      desc: "主管：「病假扣半薪，事假扣全薪，不要搞混了。」",
      status: "locked",
      xpReward: 30,
      badgeReward: "薪資精算",
      downloadFile: "M01_Task_04_Deduction.xlsx",
      timeLimit: 900,
      requirements: ["使用 IFS 或巢狀 IF 判斷假別扣款率", "結合日薪計算扣款金額", "使用 ROUND 取整數"],
      skillNodes: [{ name: "多條件判斷", formula: "=IFS(Type=\"病假\", 0.5, ...)", context: "多種假別邏輯", videoTitle: "IFS 函數教學" }]
    },
    {
      id: 6,
      module: "考勤與工時",
      title: "BOSS. 自動化考勤異常總表",
      scenario: "【BOSS 關卡：月結大魔王】需要將整個月的所有打卡紀錄匯整，自動標記「遲到、早退、未打卡、曠職」四種狀態，並產出異常報表。",
      desc: "人資長：「我只要看一張表，告訴我誰有問題。」",
      status: "locked",
      isBoss: true,
      xpReward: 50,
      badgeReward: "時空領主",
      downloadFile: "M01_Task_05_Boss_Report.xlsx",
      timeLimit: 1800,
      requirements: ["整合所有考勤邏輯", "使用 OR/AND 複合邏輯判斷", "使用條件式格式設定紅字警示"],
      skillNodes: [{ name: "複合邏輯", formula: "=IF(OR(A1, AND(B1, C1))...)", context: "複雜狀態判定", videoTitle: "邏輯函數進階" }]
    },

    // ==========================================
    // Module 2: 人事與組織
    // ==========================================
    {
      id: 7,
      module: "人事與組織",
      type: "quiz",
      title: "⭐ 小試身手：組織數據觀念題",
      scenario: "【情境：結構分析暖身】在進行複雜的人力分析前，確認你對統計函數與日期計算的理解。",
      desc: "人資長：「COUNTIF 和 DATEDIF 是人資的左膀右臂，你熟悉嗎？」",
      status: "locked",
      xpReward: 20,
      badgeReward: "組織架構師",
      requirements: ["熟悉 COUNTIF 的條件設定", "理解 DATEDIF 的單位代號"],
      skillNodes: [{ name: "觀念檢測", formula: "Quiz Mode", context: "函數語法確認", videoTitle: "統計函數基礎" }],
      practices: [
        {
          id: "p2_1",
          question: "如果要統計「業務部」一共有多少人，以下哪個公式正確？",
          options: ["=COUNT(部門範圍)", "=COUNTIF(部門範圍, \"業務部\")", "=SUMIF(部門範圍, \"業務部\")"],
          answer: 1,
          explanation: "✅ COUNTIF(範圍, 條件) 是專門用來計算符合特定條件（如「業務部」）儲存格數量的函數。COUNT 只能算數字個數，SUMIF 是加總數值。"
        },
        {
          id: "p2_2",
          question: "計算員工年資時，DATEDIF(到職日, 今天, \"Y\") 中的 \"Y\" 代表什麼？",
          options: ["計算總天數", "計算總月數", "計算滿年數"],
          answer: 2,
          explanation: "✅ \"Y\" 代表 Year，即計算兩個日期之間相差的「滿年數」。若要算月數則用 \"M\"。"
        }
      ]
    },
    {
      id: 8,
      module: "人事與組織",
      title: "L1. 部門人數與性別統計",
      scenario: "【情境：性平報告】政府要求申報公司內部的男女比例。請快速統計全公司及各部門的男性與女性人數。",
      desc: "法務：「下週要交報告，請盡快給我數據。」",
      status: "locked",
      xpReward: 15,
      badgeReward: "人口普查員",
      downloadFile: "M02_Task_01_Gender_Stats.xlsx",
      timeLimit: 600,
      requirements: ["使用 COUNTIF 統計全公司性別", "使用 COUNTIFS 統計各部門性別"],
      skillNodes: [{ name: "多條件統計", formula: "=COUNTIFS(DeptRange, Dept, GenderRange, \"男\")", context: "分部門性別統計", videoTitle: "COUNTIFS 應用" }]
    },
    {
      id: 9,
      module: "人事與組織",
      title: "L2. 員工學歷結構分析",
      scenario: "【情境：人才盤點】公司想了解碩博士比例。請整理員工學歷資料，製作出一份學歷分佈的統計表。",
      desc: "招募經理：「我們想知道研發部是不是都是碩士以上？」",
      status: "locked",
      xpReward: 20,
      badgeReward: "學術探險家",
      downloadFile: "M02_Task_02_Education.xlsx",
      timeLimit: 720,
      requirements: ["清理學歷欄位 (去除空白)", "統計各學歷人數", "計算佔比 %"],
      skillNodes: [{ name: "資料清理", formula: "=TRIM()", context: "去除多餘空白", videoTitle: "資料清理基礎" }]
    },
    {
      id: 10,
      module: "人事與組織",
      title: "L3. 退休預警名單製作",
      scenario: "【情境：接班計畫】這比暖身題更複雜。你需要依據勞基法規定的退休條件（年資滿25年 或 年齡滿65歲），找出符合任一條件的員工。",
      desc: "人資長：「這次條件變嚴格了，符合任一條件都要列出來。」",
      status: "locked",
      xpReward: 25,
      badgeReward: "結構分析師",
      downloadFile: "M02_Task_03_Retirement.xlsx",
      timeLimit: 900,
      requirements: ["計算年資與年齡", "使用 OR 邏輯判斷是否符合退休資格"],
      skillNodes: [{ name: "退休判斷", formula: "=OR(Age>=65, WorkYear>=25)", context: "多重退休條件", videoTitle: "邏輯判斷進階" }]
    },
    {
      id: 11,
      module: "人事與組織",
      title: "L4. 職等與薪資區間分佈",
      scenario: "【情境：薪酬分析】請將所有員工的薪資依據級距表 (Band 1~5) 進行分類，檢查是否有人的薪資低於該職等的下限。",
      desc: "薪酬經理：「有人低於職等薪資下限嗎？請抓出來。」",
      status: "locked",
      xpReward: 30,
      badgeReward: "薪酬守門員",
      downloadFile: "M02_Task_04_Salary_Band.xlsx",
      timeLimit: 1200,
      requirements: ["使用 VLOOKUP (模糊比對) 判定薪資區間", "標記異常薪資"],
      skillNodes: [{ name: "區間查找", formula: "=VLOOKUP(Val, Table, Col, TRUE)", context: "數值區間歸類", videoTitle: "VLOOKUP 模糊比對" }]
    },
    {
      id: 12,
      module: "人事與組織",
      title: "BOSS. 製作動態組織圖資料源",
      scenario: "【BOSS 關卡：組織重整】公司組織大調整，需要畫出新的組織圖。請整理「員工ID」與「匯報主管ID」，並檢查是否有斷層或循環匯報。",
      desc: "總經理：「新的組織架構圖，資料源一定要正確。」",
      status: "locked",
      isBoss: true,
      xpReward: 50,
      badgeReward: "組織架構師",
      downloadFile: "M02_Task_05_Boss_OrgChart.xlsx",
      timeLimit: 1800,
      requirements: ["使用 VLOOKUP 自我參照 (Self-Join) 找出主管姓名", "檢查無效的主管 ID"],
      skillNodes: [{ name: "自我參照", formula: "VLOOKUP 查找同一張表", context: "層級關係建立", videoTitle: "進階資料關聯" }]
    },

    // ==========================================
    // Module 3: 績效評核
    // ==========================================
    {
      id: 13,
      module: "績效評核",
      type: "quiz",
      title: "⭐ 小試身手：圖表與評核邏輯",
      scenario: "【情境：圖表暖身】在製作複雜的調薪矩陣前，先確認你對 IF 判斷式與基本圖表的理解。",
      desc: "績效經理：「基本功要紮實，圖表才不會畫錯。」",
      status: "locked",
      xpReward: 25,
      badgeReward: "績效分析師",
      requirements: ["判斷 IF 巢狀邏輯", "選擇正確的圖表類型"],
      skillNodes: [{ name: "觀念檢測", formula: "Quiz Mode", context: "邏輯與視覺化", videoTitle: "Excel 圖表入門" }],
      practices: [
        {
          id: "p3_1",
          question: "如果要呈現各部門人數佔總人數的「比例」，最適合使用哪種圖表？",
          options: ["折線圖", "圓餅圖", "散佈圖"],
          answer: 1,
          explanation: "✅ 圓餅圖 (Pie Chart) 專門用於顯示部分佔整體的比例關係。折線圖適合顯示趨勢，散佈圖適合顯示相關性。"
        },
        {
          id: "p3_2",
          question: "公式 =IF(A1>=80, \"優\", IF(A1>=60, \"可\", \"差\"))，當 A1 為 70 時，會回傳？",
          options: ["優", "可", "差"],
          answer: 1,
          explanation: "✅ 首先判斷 A1>=80 (70>=80) 為 False，進入第二個 IF；接著判斷 A1>=60 (70>=60) 為 True，因此回傳 \"可\"。"
        }
      ]
    },
    {
      id: 14,
      module: "績效評核",
      title: "L1. 自動轉換績效等級",
      scenario: "【情境：分級制度】這次要處理更細緻的等級：S, A, B, C, D。請建立一個對照表，自動將 500 位員工的分數轉換為等級。",
      desc: "績效專員：「手動分 5 個等級太累了，請用 VLOOKUP 解決。」",
      status: "locked",
      xpReward: 15,
      badgeReward: "評級快手",
      downloadFile: "M03_Task_01_Rating.xlsx",
      timeLimit: 600,
      requirements: ["使用 VLOOKUP (模糊比對) 轉換分數為等級"],
      skillNodes: [{ name: "等級轉換", formula: "=VLOOKUP(Score, {0,\"D\";60,\"C\"...}, 2)", context: "分數轉等第", videoTitle: "區間轉換技巧" }]
    },
    {
      id: 15,
      module: "績效評核",
      title: "L2. 計算加權績效總分",
      scenario: "【情境：綜合評分】年度績效由「KPI (70%)」與「核心職能 (30%)」組成。請計算每位員工的加權總分。",
      desc: "績效經理：「記得依據權重計算，不要直接平均。」",
      status: "locked",
      xpReward: 20,
      badgeReward: "加權運算師",
      downloadFile: "M03_Task_02_Weighted_Score.xlsx",
      timeLimit: 720,
      requirements: ["使用 SUMPRODUCT 或基礎運算計算加權分"],
      skillNodes: [{ name: "加權平均", formula: "=Score1*0.7 + Score2*0.3", context: "不同權重計算", videoTitle: "數學運算基礎" }]
    },
    {
      id: 16,
      module: "績效評核",
      title: "L3. 部門內績效排名",
      scenario: "【情境：強制分配】公司採強制分配制。請計算員工在「自己部門內」的排名，而非全公司排名。",
      desc: "人資長：「研發部第一名是誰？業務部第一名又是誰？」",
      status: "locked",
      xpReward: 25,
      badgeReward: "排名裁判",
      downloadFile: "M03_Task_03_Ranking.xlsx",
      timeLimit: 900,
      requirements: ["使用 SUMPRODUCT 或 COUNTIFS 製作分組排名"],
      skillNodes: [{ name: "分組排名", formula: "=SUMPRODUCT((Dept=A2)*(Score>B2))+1", context: "部門內排名邏輯", videoTitle: "SUMPRODUCT 進階" }]
    },
    {
      id: 17,
      module: "績效評核",
      title: "L4. 績效視覺化儀表板",
      scenario: "【情境：視覺化分析】製作動態圖表分析各部門的優秀比例 (S級與A級佔比)，並加上篩選器。",
      desc: "總經理：「我要一個可以切換部門的動態圖表。」",
      status: "locked",
      xpReward: 30,
      badgeReward: "圖表藝術家",
      downloadFile: "M03_Task_04_Chart.xlsx",
      timeLimit: 1200,
      requirements: ["使用樞紐分析表與篩選器 (Slicer)", "製作堆疊長條圖"],
      skillNodes: [{ name: "動態圖表", formula: "Pivot Chart + Slicer", context: "互動式報表", videoTitle: "Excel 儀表板製作" }]
    },
    {
      id: 18,
      module: "績效評核",
      title: "BOSS. 年度調薪矩陣試算",
      scenario: "【BOSS 關卡：調薪作業】依據「績效等級」與「目前薪資落點 (Compa-Ratio)」決定調薪幅度。這是一個二維矩陣查表任務。",
      desc: "薪酬委員會：「績效好且薪資偏低的人，調幅要最高。」",
      status: "locked",
      isBoss: true,
      xpReward: 50,
      badgeReward: "獎酬戰略家",
      downloadFile: "M03_Task_05_Boss_Merit.xlsx",
      timeLimit: 1800,
      requirements: ["使用 INDEX 與 MATCH 進行矩陣查詢 (Matrix Lookup)", "試算調薪預算"],
      skillNodes: [{ name: "矩陣查詢", formula: "=INDEX(Matrix, MATCH(Row), MATCH(Col))", context: "二維表交叉查詢", videoTitle: "INDEX+MATCH 組合技" }]
    },

    // ==========================================
    // Module 4: 員工關係
    // ==========================================
    {
      id: 19,
      module: "員工關係",
      type: "quiz",
      title: "⭐ 小試身手：日期處理常識",
      scenario: "【情境：福委會暖身】辦活動常需要處理日期。在開始製作自動化提醒前，先確認基礎日期函數。",
      desc: "福委會：「如果連月份都抓錯，生日禮金就發錯人了。」",
      status: "locked",
      xpReward: 30,
      badgeReward: "員工關懷大使",
      requirements: ["理解 MONTH 與 DAY 函數", "文字串接的基本概念"],
      skillNodes: [{ name: "觀念檢測", formula: "Quiz Mode", context: "日期與文字", videoTitle: "日期基礎函數" }],
      practices: [
        {
          id: "p4_1",
          question: "A1 儲存格是 '2023/12/25'，公式 =MONTH(A1) 會回傳什麼？",
          options: ["December", "12", "2023"],
          answer: 1,
          explanation: "✅ MONTH 函數只會回傳該日期的「月份數字」(1-12)。若要顯示英文月份，需要使用 TEXT 函數，例如 =TEXT(A1, \"mmmm\")。"
        },
        {
          id: "p4_2",
          question: "如果要將 A1 '王' 與 B1 '小明' 合併成 '王小明'，哪個公式正確？",
          options: ["=A1 + B1", "=A1 & B1", "=SUM(A1, B1)"],
          answer: 1,
          explanation: "✅ 在 Excel 中，& 符號 (Ampersand) 是專門用於串接兩個文字字串的運算子。+ 號只能用於數字加法。"
        }
      ]
    },
    {
      id: 20,
      module: "員工關係",
      title: "L1. 壽星名單擷取練習",
      scenario: "【情境：精準提醒】這次除了找月份，還要設定「生日前 7 天」自動變色的提醒機制。",
      desc: "行政專員：「我希望 Excel 打開就會自動提醒我誰快生日了。」",
      status: "locked",
      xpReward: 15,
      badgeReward: "慶生大使",
      downloadFile: "M04_Task_01_Birthday.xlsx",
      timeLimit: 600,
      requirements: ["使用 設定格式化的條件", "使用 TODAY() 動態比對"],
      skillNodes: [{ name: "條件格式化", formula: "=AND(Month=..., Day=...)", context: "視覺化提醒", videoTitle: "條件格式化教學" }]
    },
    {
      id: 21,
      module: "員工關係",
      title: "L2. 試用期滿考核提醒",
      scenario: "【情境：新人追蹤】每位新進員工在到職滿 3 個月時需進行考核。請計算每人的「試用期滿日」。",
      desc: "人資專員：「請算出確切日期，我們要發考核單。」",
      status: "locked",
      xpReward: 20,
      badgeReward: "守門員",
      downloadFile: "M04_Task_02_Probation.xlsx",
      timeLimit: 720,
      requirements: ["使用 EDATE 計算 N 個月後的日期"],
      skillNodes: [{ name: "日期推算", formula: "=EDATE(Start, 3)", context: "計算幾個月後", videoTitle: "EDATE 函數" }]
    },
    {
      id: 22,
      module: "員工關係",
      title: "L3. 久任獎金年資計算",
      scenario: "【情境：資深員工獎勵】公司頒發 5年、10年、15年 久任金牌。請精確計算工齡，並標記今年符合領獎資格的人。",
      desc: "福委會：「今年誰滿 10 年了？金牌要刻名字。」",
      status: "locked",
      xpReward: 25,
      badgeReward: "里程碑見證者",
      downloadFile: "M04_Task_03_Anniversary.xlsx",
      timeLimit: 900,
      requirements: ["使用 DATEDIF 計算滿年", "使用 MOD 判斷是否為 5 的倍數"],
      skillNodes: [{ name: "倍數判斷", formula: "=MOD(Years, 5)=0", context: "每5年一次", videoTitle: "MOD 餘數應用" }]
    },
    {
      id: 23,
      module: "員工關係",
      title: "L4. 滿意度問卷統計",
      scenario: "【情境：員工心聲】年度滿意度調查回收了。請依據不同部門，計算「薪資」、「環境」、「管理」三個面向的平均滿意度。",
      desc: "人資長：「哪個部門怨氣最重？數據拿來。」",
      status: "locked",
      xpReward: 30,
      badgeReward: "傾聽者",
      downloadFile: "M04_Task_04_Survey.xlsx",
      timeLimit: 1200,
      requirements: ["使用 AVERAGEIF 計算各部門平均分"],
      skillNodes: [{ name: "分類平均", formula: "=AVERAGEIF(DeptRange, Dept, ScoreRange)", context: "特定群體平均", videoTitle: "AVERAGEIF 應用" }]
    }
  ]);

  // --- 動作處理函式 ---

  const handleTaskClick = (task: Task) => {
    if (task.status === 'locked') {
      toast({
        title: "此任務尚未解鎖",
        description: "請先完成前一個任務來解鎖此關卡！",
        variant: "destructive",
      });
      return;
    }
    setActiveTask(task);
    setModalMode('info');
    setTaskUploadStatus('idle');
    setHasDownloaded(false);
    
    // 重置 Quiz 狀態
    setCurrentQuizAnswers({});
  };

  const handleDownload = () => {
    if (!activeTask) return;
    setHasDownloaded(true);
    
    // 如果有時間限制，開始計時
    if (activeTask.timeLimit) {
      setTimeLeft(activeTask.timeLimit);
      setIsTimerRunning(true);
    }

    // 模擬下載延遲
    setTimeout(() => {
      toast({
        title: "下載開始",
        description: `正在下載 ${activeTask.downloadFile}...`,
      });
    }, 500);
  };

  const handleTaskUpload = (isSuccessSimulation = true) => {
    setTaskUploadStatus('analyzing');
    
    // 模擬分析過程
    setTimeout(() => {
      if (isSuccessSimulation) {
        setTaskUploadStatus('success');
        setIsTimerRunning(false); // 停止計時
      } else {
        setTaskUploadStatus('error');
      }
    }, 2000);
  };

  const handleQuizAnswer = (questionId: string, optionIndex: number) => {
    setCurrentQuizAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleRetryQuiz = () => {
    setCurrentQuizAnswers({});
    setTaskUploadStatus('idle');
  };

  const completeTask = () => {
    if (!activeTask) return;

    // 更新任務狀態
    const updatedTasks = tasks.map(t => {
      if (t.id === activeTask.id) {
        return { ...t, status: 'completed' as const };
      }
      // 解鎖下一關
      if (t.id === activeTask.id + 1) {
        return { ...t, status: 'active' as const };
      }
      return t;
    });
    setTasks(updatedTasks);

    // 更新玩家狀態
    setPlayerState(prev => {
      const newXp = prev.xp + activeTask.xpReward;
      let newLevel = prev.level;
      let newMaxXp = prev.maxXp;
      let title = prev.title;

      // 簡單升級邏輯
      if (newXp >= prev.maxXp) {
        newLevel += 1;
        newMaxXp = Math.floor(prev.maxXp * 1.5);
        setShowLevelUp(true);
        
        // 升級稱號 (範例)
        if (newLevel === 2) title = "Excel 初學者";
        if (newLevel === 3) title = "函數探險家";
        if (newLevel === 5) title = "資料分析師";
      }

      // 新增徽章
      const newBadges = [...prev.badges];
      if (activeTask.badgeReward && !newBadges.find(b => b.name === activeTask.badgeReward)) {
        newBadges.push({
          name: activeTask.badgeReward,
          icon: activeTask.badgeIcon || "Star" // 預設圖示
        });
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        maxXp: newMaxXp,
        title,
        badges: newBadges
      };
    });

    setActiveTask(null);
    setTaskUploadStatus('idle');
    
    toast({
      title: "任務完成！",
      description: `獲得 ${activeTask.xpReward} XP 與 ${activeTask.badgeReward || '通關獎勵'}`,
      className: "bg-green-50 border-green-200 text-green-800",
    });
  };

  // --- 渲染輔助函式 ---
  
  const renderBadgeIcon = (iconName: string) => {
    // 簡單對應圖示
    switch(iconName) {
      case 'Star': return <Star className="text-yellow-400" />;
      case 'Shield': return <Shield className="text-blue-400" />;
      case 'Sword': return <Sword className="text-red-400" />;
      default: return <Award className="text-purple-400" />;
    }
  };

  // Render Assessment (能力檢測)
  const renderAssessmentContent = () => {
    if (assessmentStage === 'intro') {
      return (
        <div className="p-8 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6 animate-bounce-in">
            <BrainCircuit size={40} className="text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Excel 能力分級測驗</h2>
          <p className="text-slate-500 mb-8 max-w-md">
            在開始冒險之前，讓我們了解一下您的 Excel 程度，系統將為您推薦適合的學習路徑。
          </p>
          <button 
            onClick={() => setAssessmentStage('upload')}
            className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-indigo-700 hover:shadow-xl transition transform hover:-translate-y-1 flex items-center gap-2"
          >
            開始檢測 <ArrowRight size={20} />
          </button>
          <button 
            onClick={() => setShowAssessment(false)}
            className="mt-4 text-slate-400 text-sm hover:text-slate-600 underline"
          >
            我是新手，直接從頭開始
          </button>
        </div>
      );
    }

    if (assessmentStage === 'upload') {
      return (
        <div className="p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UploadCloud className="text-indigo-600" />
            上傳您的工作表單
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            請上傳一份您平常工作中使用的 Excel 檔案（請確保已移除敏感個資），AI 將分析其中使用的函數與結構。
          </p>
          
          <div 
            className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 transition group"
            onClick={() => {
              setAssessmentStage('analyzing');
              // 模擬分析進度
              let progress = 0;
              const interval = setInterval(() => {
                progress += 10;
                setUploadProgress(progress);
                if (progress === 30) setAnalysisSteps(prev => [...prev, "解析檔案結構..."]);
                if (progress === 60) setAnalysisSteps(prev => [...prev, "辨識函數複雜度..."]);
                if (progress === 90) setAnalysisSteps(prev => [...prev, "評估資料處理邏輯..."]);
                
                if (progress >= 100) {
                  clearInterval(interval);
                  setTimeout(() => {
                    setAssessmentStage('result');
                    setAssessmentResult({
                      level: "L2",
                      title: "Excel 進階使用者",
                      strengths: ["VLOOKUP 應用", "樞紐分析表"],
                      weaknesses: ["陣列公式", "巨集自動化"],
                      recommendedModule: 2 // 從第二模組開始
                    });
                  }, 1000);
                }
              }, 500);
            }}
          >
            <FileSpreadsheet size={48} className="text-indigo-300 group-hover:text-indigo-500 transition mb-4" />
            <span className="font-bold text-indigo-600">點擊選擇檔案</span>
            <span className="text-xs text-indigo-400 mt-1">支援 .xlsx, .csv 格式</span>
          </div>
        </div>
      );
    }

    if (assessmentStage === 'analyzing') {
      return (
        <div className="p-8 flex flex-col items-center justify-center h-full">
          <Loader className="w-16 h-16 text-indigo-600 animate-spin mb-6" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">AI 正在分析您的技能...</h3>
          
          <div className="w-full max-w-xs bg-slate-200 rounded-full h-2 mb-6 overflow-hidden">
            <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
          </div>

          <div className="space-y-2 w-full max-w-xs">
            {analysisSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-600 animate-fade-in-up">
                <CheckCircle size={14} className="text-green-500" /> {step}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (assessmentStage === 'result' && assessmentResult) {
      return (
        <div className="p-8 text-center">
          <div className="inline-block bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full text-sm font-bold mb-4">
            分析完成
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            您的等級：{assessmentResult.title}
          </h2>
          <p className="text-slate-500 mb-8">
            偵測到您已熟練 {assessmentResult.strengths.join('、')}，建議您可以跳過基礎課程，直接挑戰進階任務！
          </p>

          <div className="grid grid-cols-2 gap-4 text-left mb-8 max-w-md mx-auto bg-slate-50 p-4 rounded-lg">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase">優勢技能</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {assessmentResult.strengths.map(s => <span key={s} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{s}</span>)}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase">建議加強</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {assessmentResult.weaknesses.map(w => <span key={w} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">{w}</span>)}
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              setShowAssessment(false);
              // 解鎖到推薦模組 (模擬)
              setTasks(prev => prev.map((t, i) => {
                if (i < 6) return { ...t, status: 'completed' as const }; // 假設第一模組全過
                if (i === 6) return { ...t, status: 'active' as const };
                return t;
              }));
              setPlayerState(prev => ({ ...prev, level: 5, xp: 80, title: assessmentResult.title }));
              toast({
                 title: "已為您客製化學習路徑",
                 description: "前 6 個基礎任務已自動完成！",
              });
            }}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg w-full sm:w-auto"
          >
            進入我的專屬冒險
          </button>
        </div>
      );
    }
  };

  // Render Quiz Interface
  const renderQuiz = () => {
    if (!activeTask || !activeTask.practices) return null;
    
    const isAllAnswered = activeTask.practices.every(p => currentQuizAnswers[p.id] !== undefined);
    const isAllCorrect = activeTask.practices.every(p => currentQuizAnswers[p.id] === p.answer);

    return (
      <div className="p-6 h-full flex flex-col">
         <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
            <BrainCircuit className="text-indigo-600" />
            觀念檢測
          </h3>
          <div className="text-sm text-slate-500">
            共 {activeTask.practices.length} 題
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-8 pr-2">
          {activeTask.practices.map((practice, index) => {
            const userAnswer = currentQuizAnswers[practice.id];
            const isAnswered = userAnswer !== undefined;
            const isCorrect = userAnswer === practice.answer;

            return (
              <div key={practice.id} className="space-y-3">
                <div className="font-bold text-slate-800 flex gap-2">
                  <span className="text-indigo-600">{index + 1}.</span>
                  {practice.question}
                </div>
                
                <div className="space-y-2 pl-5">
                  {practice.options.map((option, optIdx) => (
                    <div 
                      key={optIdx}
                      onClick={() => !isAnswered && handleQuizAnswer(practice.id, optIdx)}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between
                        ${isAnswered 
                          ? (optIdx === practice.answer 
                              ? 'bg-green-50 border-green-300 text-green-800' 
                              : (optIdx === userAnswer ? 'bg-red-50 border-red-300 text-red-800' : 'bg-slate-50 border-slate-100 opacity-50'))
                          : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                        }
                      `}
                    >
                      <span>{option}</span>
                      {isAnswered && optIdx === practice.answer && <CheckCircle size={18} className="text-green-600" />}
                      {isAnswered && optIdx === userAnswer && optIdx !== practice.answer && <X size={18} className="text-red-600" />}
                    </div>
                  ))}
                </div>

                {/* 解析 (回答後顯示) */}
                {isAnswered && (
                  <div className={`ml-5 p-3 rounded text-sm flex items-start gap-2 animate-fade-in-up ${
                    isCorrect ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Lightbulb size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block mb-1">{isCorrect ? "答對了！" : "可惜答錯了..."} 解析：</span>
                      {practice.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 底部按鈕區 */}
        <div className="mt-6 pt-4 border-t border-slate-100 sticky bottom-0 bg-white pb-2">
          {!isAllAnswered ? (
            <div className="text-center text-slate-400 text-sm py-3">
              請回答所有問題以完成驗收
            </div>
          ) : (
            isAllCorrect ? (
              <button 
                onClick={completeTask}
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition shadow-lg flex items-center justify-center gap-2 animate-bounce-in"
              >
                <Trophy size={18} />
                全對通關！領取獎勵
              </button>
            ) : (
              <div className="flex gap-3">
                <button 
                  onClick={handleRetryQuiz}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-200 transition flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  重新挑戰
                </button>
                <button 
                  onClick={completeTask} // 允許答錯通關，因為已看過詳解
                  className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition shadow-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  已閱讀詳解，完成練習
                </button>
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  // ... (Render Task Upload logic 保持不變)
  const renderTaskUpload = () => {
    if (!activeTask) return null;
    
    if (taskUploadStatus === 'success') {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 animate-bounce-in">
            <Check size={40} strokeWidth={4} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">驗收通過！</h3>
          <p className="text-slate-600 mb-8">檔案檢查無誤，您已完美達成所有通關條件。</p>
          <button onClick={completeTask} className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg">領取獎勵</button>
        </div>
      );
    }

    if (taskUploadStatus === 'analyzing') {
       return (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
          <Loader className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">正在檢查檔案...</h3>
          <p className="text-slate-500 text-sm">系統正在驗證：<br/>重複值刪除、空白欄位填補...</p>
        </div>
      );
    }

    return (
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
            <UploadCloud className="text-indigo-600" />
            上傳任務成果
          </h3>
          
          {(activeTask.timeLimit && (isTimerRunning || hasDownloaded)) && (
            <div className={`flex items-center gap-2 font-mono text-xl font-bold border px-3 py-1 rounded-lg ${timeLeft < 60 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
              <Timer size={20} />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0">
            <Download size={20} />
          </div>
          <div>
            <h4 className="font-bold text-blue-900 text-sm mb-1">
              第一步：下載情境題本 
              {activeTask.timeLimit ? ' (計時開始！)' : ''}
            </h4>
            <p className="text-xs text-blue-700 mb-2">
              {activeTask.timeLimit ? '點擊下載後將自動開始倒數，請在時間內完成並上傳。' : '請下載檔案完成練習後上傳。'}
            </p>
            <button 
              onClick={handleDownload}
              disabled={hasDownloaded}
              className={`text-xs border px-3 py-1.5 rounded flex items-center gap-1 font-bold transition-all ${
                hasDownloaded 
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                  : 'bg-white border-blue-300 text-blue-700 hover:bg-blue-50 hover:shadow'
              }`}
            >
              {hasDownloaded ? <Check size={14} /> : <FileSpreadsheet size={14} />} 
              {hasDownloaded ? (activeTask.timeLimit ? '已下載 (計時中)' : '已下載') : `下載 ${activeTask.downloadFile}`}
            </button>
          </div>
        </div>

        <p className="text-slate-500 text-sm mb-4">第二步：將完成後的檔案在此上傳</p>

        <div className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 relative transition-colors ${
          !hasDownloaded ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed' : 'border-indigo-300 bg-indigo-50/30'
        }`}>
          
          {!hasDownloaded && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow text-sm font-bold text-slate-600 flex items-center gap-2">
                <Lock size={16} /> 請先下載題目以解鎖上傳
              </div>
            </div>
          )}

          {taskUploadStatus === 'error' && (
            <div className="absolute top-4 left-4 right-4 bg-red-100 text-red-700 p-3 rounded flex items-center gap-2 text-sm font-bold animate-shake">
              <AlertCircle size={18} />
              檢查未通過！請確認是否已刪除所有重複資料。
            </div>
          )}

          <FileSpreadsheet size={48} className={hasDownloaded ? "text-indigo-400" : "text-slate-300"} />
          
          <div className="flex flex-col gap-2 mt-4">
             <button onClick={() => hasDownloaded && handleTaskUpload(false)} disabled={!hasDownloaded} className="px-4 py-2 text-sm bg-white border border-red-200 text-red-600 rounded hover:bg-red-50 disabled:opacity-50 disabled:hover:bg-white">[演示] 上傳錯誤檔案</button>
            <button onClick={() => hasDownloaded && handleTaskUpload(true)} disabled={!hasDownloaded} className="px-4 py-2 text-sm bg-white border border-green-200 text-green-600 rounded hover:bg-green-50 disabled:opacity-50 disabled:hover:bg-white">[演示] 上傳正確檔案</button>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-lg hover:bg-slate-200 transition" onClick={() => setModalMode('info')}>返回說明</button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col md:flex-row relative">
      
      {/* --- 能力分級測驗 Modal --- */}
      {showAssessment && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-fade-in-up min-h-[400px] flex flex-col justify-center">
            {renderAssessmentContent()}
          </div>
        </div>
      )}

      {/* Sidebar - Player Stats */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 p-6 flex flex-col shadow-sm z-10">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold text-slate-900 flex items-center justify-center gap-2">
            <TrendingUp className="text-indigo-600" />
            HR 練功學院
          </h1>
          <p className="text-xs text-slate-500 mt-1">Gamified Learning System</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white shadow-lg mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
            <Trophy size={100} />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold border-2 border-white/50">
              {playerState.level}
            </div>
            <div>
              <div className="font-bold text-lg">{playerState.name}</div>
              <div className="text-indigo-100 text-sm bg-indigo-700/50 px-2 py-0.5 rounded-full inline-block">
                Lv.{playerState.level} {playerState.title}
              </div>
            </div>
          </div>
          <div className="mb-1 flex justify-between text-xs font-medium text-indigo-100">
            <span>XP 經驗值</span>
            <span>{playerState.xp} / {playerState.maxXp}</span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-2.5 mb-2 overflow-hidden">
            <div 
              className="bg-yellow-400 h-2.5 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${Math.min((playerState.xp / playerState.maxXp) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-indigo-200 text-center">
            再獲得 {Math.max(playerState.maxXp - playerState.xp, 0)} XP 即可升級！
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">我的徽章成就</h3>
          <div className="grid grid-cols-4 gap-2">
            {playerState.badges.map((badge, idx) => (
              <div key={idx} className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors cursor-help group relative">
                {renderBadgeIcon(badge.icon)}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-slate-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center shadow-lg">
                  {badge.name}
                </div>
              </div>
            ))}
            {[...Array(Math.max(4 - (playerState.badges.length % 4 || 4), 0))].map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square border-2 border-dashed border-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>

        <div className="mt-auto bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-start gap-3">
            <BookOpen className="text-blue-500 shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="font-bold text-blue-900 text-sm">卡關了嗎？</h4>
              <p className="text-xs text-blue-700 mt-1">查看「Excel 技能樹」與教學影片庫來獲得提示。</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content - Quest Map */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-slate-50">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">冒險地圖 (Quest Map)</h2>
            <p className="text-slate-500">完成任務卡以累積 XP 並解鎖下一階段技能。</p>
          </div>
        </header>
        <div className="max-w-3xl mx-auto space-y-6 relative pb-20">
          <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-slate-200 -z-10"></div>
          {tasks.map((task) => (
            <div 
              key={task.id}
              onClick={() => handleTaskClick(task)}
              className={`
                relative flex items-center gap-6 p-5 rounded-xl border-2 transition-all duration-300
                ${task.status === 'completed' ? 'bg-white border-green-200 opacity-75' : ''}
                ${task.status === 'active' ? 'bg-white border-indigo-500 shadow-lg scale-[1.02] cursor-pointer hover:shadow-xl' : ''}
                ${task.status === 'locked' ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed grayscale' : ''}
              `}
            >
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center shrink-0 border-4 z-10 transition-colors
                ${task.status === 'completed' ? 'bg-green-100 border-green-200 text-green-600' : ''}
                ${task.status === 'active' ? 'bg-indigo-600 border-indigo-200 text-white animate-pulse-slow' : ''}
                ${task.status === 'locked' ? 'bg-slate-200 border-slate-300 text-slate-400' : ''}
              `}>
                {task.status === 'completed' && <CheckCircle size={32} />}
                {task.status === 'active' && <Sword size={32} />}
                {task.status === 'locked' && <Lock size={32} />}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                    task.status === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {task.module}
                  </span>
                  {task.type === 'quiz' && (
                    <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      測驗題
                    </span>
                  )}
                  {task.isBoss && (
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      BOSS 關卡
                    </span>
                  )}
                  {task.status === 'completed' && (
                    <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                      <CheckCircle size={12} /> 已完成
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-800">{task.title}</h3>
                <p className="text-slate-500 text-sm">{task.desc}</p>
              </div>

              {task.status !== 'completed' && (
                <div className="hidden sm:flex flex-col items-end gap-1 text-sm font-medium text-slate-400">
                  <div className="flex items-center gap-1 text-yellow-600">
                    <span className="font-bold">+{task.xpReward} XP</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Task Detail Modal (任務資訊 OR 測驗) */}
      {activeTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full animate-fade-in-up my-8 flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
            
            {/* 根據 modalMode 顯示不同內容 */}
            {modalMode === 'upload' ? (
              // --- 上傳/測驗模式 (佔滿全寬) ---
              <div className="w-full flex flex-col h-[600px] overflow-y-auto">
                <div className="bg-indigo-700 p-4 text-white flex justify-between items-center shrink-0">
                  <h2 className="font-bold flex items-center gap-2">
                    <Trophy className="text-yellow-400" size={20} /> 
                    任務驗收：{activeTask.title}
                  </h2>
                  <button onClick={() => setActiveTask(null)} className="text-white/70 hover:text-white"><X /></button>
                </div>
                {/* 根據任務類型顯示不同內容：測驗介面 或 上傳介面 */}
                {activeTask.type === 'quiz' ? renderQuiz() : renderTaskUpload()}
              </div>
            ) : (
              // --- 資訊模式 (原有佈局) ---
              <>
                {/* Left: 任務內容 */}
                <div className="flex-1 flex flex-col overflow-y-auto">
                  <div className="bg-indigo-600 p-6 text-white relative shrink-0">
                    <div className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-2">
                      MISSION CARD
                    </div>
                    <h2 className="text-2xl font-bold">{activeTask.title}</h2>
                    <div className="mt-3 bg-indigo-700/50 p-3 rounded-lg border border-indigo-400/30">
                      <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                        {activeTask.scenario || activeTask.desc}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div>
                      <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <CheckSquare size={18} className="text-green-500" />
                        通關條件
                      </h4>
                      <ul className="space-y-2">
                        {activeTask.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-100">
                            <div className="w-5 h-5 border-2 border-slate-300 rounded flex items-center justify-center shrink-0 mt-0.5">
                              <div className="w-2.5 h-2.5 bg-transparent rounded-sm"></div>
                            </div>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Award size={18} className="text-yellow-500" />
                        任務獎勵
                      </h4>
                      <div className="flex gap-4">
                        <div className="flex-1 bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-center gap-3">
                          <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                            <Star size={20} />
                          </div>
                          <div>
                            <div className="text-xs text-yellow-700 font-bold">經驗值</div>
                            <div className="font-bold text-yellow-800">+{activeTask.xpReward} XP</div>
                          </div>
                        </div>
                        <div className="flex-1 bg-purple-50 border border-purple-200 p-3 rounded-lg flex items-center gap-3">
                          <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                            <Award size={20} />
                          </div>
                          <div>
                            <div className="text-xs text-purple-700 font-bold">徽章</div>
                            <div className="font-bold text-purple-800">{activeTask.badgeReward}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 border-t border-slate-100 mt-auto flex gap-3 bg-white sticky bottom-0">
                    <button 
                       className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-lg hover:bg-slate-200 transition"
                       onClick={() => setActiveTask(null)}
                    >
                      稍後再做
                    </button>
                    <button 
                      className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                      onClick={() => setModalMode('upload')}
                    >
                      {activeTask.type === 'quiz' ? <BrainCircuit size={18} /> : <UploadCloud size={18} />}
                      {activeTask.type === 'quiz' ? '開始測驗' : '提交成果檔案'}
                    </button>
                  </div>
                </div>

                {/* Right: 技能補給站 (影片與技能節點) */}
                <div className="w-full md:w-[400px] bg-slate-50 border-l border-slate-200 flex flex-col">
                  <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      <PlayCircle size={20} className="text-red-500" />
                      技能補給站
                    </h4>
                    <button onClick={() => setActiveTask(null)} className="md:hidden text-slate-400">
                      <X />
                    </button>
                    <button onClick={() => setActiveTask(null)} className="hidden md:block text-slate-400 hover:text-slate-600">
                      <X />
                    </button>
                  </div>

                  <div className="p-4 flex-1 overflow-y-auto">
                    <div className="space-y-4">
                      <div className="text-sm text-slate-600 mb-2">
                        本任務對應的 HR 技能樹節點，請點擊觀看教學：
                      </div>
                      
                      {activeTask.skillNodes && activeTask.skillNodes.map((node, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-indigo-300 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                              <Code size={16} className="text-indigo-500" />
                              {node.name}
                            </h5>
                          </div>
                          <div className="bg-slate-50 p-2 rounded text-xs font-mono text-slate-600 mb-2 break-all">
                            {node.formula}
                          </div>
                          <p className="text-xs text-slate-500 mb-3">{node.context}</p>
                          <a 
                            href="#" 
                            className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded hover:bg-red-100 transition w-full justify-center"
                            onClick={(e) => e.preventDefault()} 
                          >
                            <Youtube size={14} />
                            觀看教學影片：{node.videoTitle}
                          </a>
                        </div>
                      ))}

                      {(!activeTask.skillNodes || activeTask.skillNodes.length === 0) && (
                        <div className="h-40 flex flex-col items-center justify-center text-slate-400 text-center">
                          <ClipboardList size={32} className="mb-2 opacity-50" />
                          <p className="text-xs">本任務暫無相關技能節點</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Level Up Overlay */}
      {showLevelUp && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
          <div className="text-center text-white relative">
            <div className="absolute inset-0 bg-indigo-500 blur-[100px] opacity-50 rounded-full"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 drop-shadow-lg">LEVEL UP!</h2>
              <div className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="text-slate-300">Lv.{playerState.level - 1}</span>
                <ArrowRight />
                <span className="text-yellow-400 text-3xl">Lv.{playerState.level}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 max-w-sm w-full mb-8">
                <h3 className="text-xl font-bold mb-1">{playerState.title}</h3>
                <p className="text-indigo-200 text-sm">您已解鎖新的稱號與權限！</p>
              </div>
              <button 
                onClick={() => setShowLevelUp(false)}
                className="bg-white text-indigo-600 px-10 py-3 rounded-full font-bold text-lg hover:bg-indigo-50 transition shadow-xl transform hover:scale-105"
              >
                繼續冒險
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
