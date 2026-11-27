/* Gamers Gold Top-Up — motor de idiomas local, mantenido desde GitHub */
(() => {
  "use strict";

  const LANGS = [
    ["es","Español"],["en","English"],["pt","Português"],["fr","Français"],["de","Deutsch"],
    ["it","Italiano"],["ru","Русский"],["zh-CN","中文"],["ja","日本語"],["ar","العربية"]
  ];
  const STORE_KEY = "gg_language";
  const getStored = () => { try { return localStorage.getItem(STORE_KEY) || "es"; } catch (_) { return "es"; } };
  const setStored = value => { try { localStorage.setItem(STORE_KEY,value); } catch (_) {} };
  const current = () => getStored();
  const originals = new WeakMap();
  const lastTranslated = new WeakMap();
  const attributeOriginals = new WeakMap();
  const attributeLast = new WeakMap();
  let observer = null;
  let scheduled = false;

  /*
   * Traducciones propias: el sitio no envía textos a servicios externos.
   * Orden de idiomas: EN, PT, FR, DE, IT, RU, ZH-CN, JA, AR.
   * Las claves son textos reales de la interfaz; nombres de juegos, productos,
   * importes, IDs, códigos y datos privados quedan intactos.
   */
  const ROWS = [
    ["Inicio",["Home","Início","Accueil","Startseite","Home","Главная","首页","ホーム","الرئيسية"]],
    ["Tienda",["Store","Loja","Boutique","Shop","Negozio","Магазин","商店","ストア","المتجر"]],
    ["Revendedores",["Resellers","Revendedores","Revendeurs","Wiederverkäufer","Rivenditori","Реселлеры","分销商","リセラー","الموزعون"]],
    ["Atrás",["Back","Voltar","Retour","Zurück","Indietro","Назад","返回","戻る","رجوع"]],
    ["Guardar",["Save","Guardar","Enregistrer","Speichern","Salva","Сохранить","保存","保存","حفظ"]],
    ["Guardar cambios",["Save changes","Salvar alterações","Enregistrer les modifications","Änderungen speichern","Salva modifiche","Сохранить изменения","保存更改","変更を保存","حفظ التغييرات"]],
    ["Cancelar",["Cancel","Cancelar","Annuler","Abbrechen","Annulla","Отмена","取消","キャンセル","إلغاء"]],
    ["Cerrar",["Close","Fechar","Fermer","Schließen","Chiudi","Закрыть","关闭","閉じる","إغلاق"]],
    ["Idioma",["Language","Idioma","Langue","Sprache","Lingua","Язык","语言","言語","اللغة"]],
    ["Idioma de la plataforma",["Platform language","Idioma da plataforma","Langue de la plateforme","Plattformsprache","Lingua della piattaforma","Язык платформы","平台语言","プラットフォームの言語","لغة المنصة"]],
    ["Guardar idioma",["Save language","Salvar idioma","Enregistrer la langue","Sprache speichern","Salva lingua","Сохранить язык","保存语言","言語を保存","حفظ اللغة"]],
    ["Notificaciones",["Notifications","Notificações","Notifications","Benachrichtigungen","Notifiche","Уведомления","通知","通知","الإشعارات"]],
    ["Configuración",["Settings","Configurações","Paramètres","Einstellungen","Impostazioni","Настройки","设置","設定","الإعدادات"]],
    ["Seguridad",["Security","Segurança","Sécurité","Sicherheit","Sicurezza","Безопасность","安全","セキュリティ","الأمان"]],
    ["Mis compras",["My purchases","Minhas compras","Mes achats","Meine Käufe","I miei acquisti","Мои покупки","我的订单","購入履歴","مشترياتي"]],
    ["Player ID:",["Player ID:","Player ID:","Player ID :","Player-ID:","Player ID:","Player ID:","玩家 ID：","プレイヤー ID：","معرّف اللاعب:"]],
    ["Recargar",["Top up","Recarregar","Recharger","Aufladen","Ricarica","Пополнить","充值","チャージ","اشحن"]],
    ["Enviando pedido…",["Submitting order…","Enviando pedido…","Envoi de la commande…","Bestellung wird gesendet…","Invio dell’ordine…","Отправка заказа…","正在提交订单…","注文を送信中…","جارٍ إرسال الطلب…"]],
    ["Procesando pedido…",["Processing order…","Processando pedido…","Traitement de la commande…","Bestellung wird verarbeitet…","Elaborazione dell’ordine…","Обработка заказа…","正在处理订单…","注文を処理中…","جارٍ معالجة الطلب…"]],
    ["Guardar comprobante",["Save receipt","Salvar comprovante","Enregistrer le reçu","Beleg speichern","Salva ricevuta","Сохранить квитанцию","保存凭证","領収書を保存","حفظ الإيصال"]],
    ["Estado del pedido:",["Order status:","Status do pedido:","État de la commande :","Bestellstatus:","Stato dell’ordine:","Статус заказа:","订单状态：","注文状況：","حالة الطلب:"]],
    ["Pedido N.º:",["Order No.:","Pedido nº:","Commande n° :","Bestellnr.:","Ordine n.:","Заказ №:","订单号：","注文番号：","رقم الطلب:"]],
    ["Fecha:",["Date:","Data:","Date :","Datum:","Data:","Дата:","日期：","日付：","التاريخ:"]],
    ["Precio:",["Price:","Preço:","Prix :","Preis:","Prezzo:","Цена:","价格：","価格：","السعر:"]],
    ["Producto:",["Product:","Produto:","Produit :","Produkt:","Prodotto:","Товар:","产品：","商品：","المنتج:"]],
    ["Juego:",["Game:","Jogo:","Jeu :","Spiel:","Gioco:","Игра:","游戏：","ゲーム：","اللعبة:"]],
    ["Gift Card:",["Gift Card:","Cartão-presente:","Carte cadeau :","Geschenkkarte:","Carta regalo:","Подарочная карта:","礼品卡：","ギフトカード：","بطاقة هدايا:"]],
    ["Correo de entrega:",["Delivery email:","E-mail de entrega:","E-mail de livraison :","E-Mail für Zustellung:","E-mail di consegna:","Электронная почта для доставки:","收件邮箱：","お届け先メール：","بريد التسليم:"]],
    ["Soporte",["Support","Suporte","Assistance","Support","Assistenza","Поддержка","客服支持","サポート","الدعم"]],
    ["No encontramos el pedido",["We couldn't find the order","Não encontramos o pedido","Commande introuvable","Bestellung nicht gefunden","Ordine non trovato","Заказ не найден","未找到订单","注文が見つかりません","لم نعثر على الطلب"]],
    ["Ir a Mis compras",["Go to My purchases","Ir para Minhas compras","Voir mes achats","Zu meinen Käufen","Vai ai miei acquisti","Перейти к моим покупкам","前往我的订单","購入履歴へ","الانتقال إلى مشترياتي"]],
    ["Cargando tarjetas disponibles...",["Loading available cards...","Carregando cartões disponíveis...","Chargement des cartes disponibles...","Verfügbare Karten werden geladen...","Caricamento delle carte disponibili...","Загрузка доступных карт...","正在加载可用卡片...","利用可能なカードを読み込み中...","جارٍ تحميل البطاقات المتاحة..."]],
    ["No hay tarjetas disponibles para esta región en este momento.",["No cards are available for this region right now.","Não há cartões disponíveis para esta região no momento.","Aucune carte n’est disponible pour cette région pour le moment.","Für diese Region sind derzeit keine Karten verfügbar.","Al momento non ci sono carte disponibili per questa regione.","В этом регионе сейчас нет доступных карт.","此地区目前没有可用卡片。","この地域では現在利用可能なカードがありません。","لا توجد بطاقات متاحة لهذه المنطقة حاليًا."]],
    ["UC",["UC","UC","UC","UC","UC","UC","UC","UC","UC"]],
    ["CP",["CP","CP","CP","CP","CP","CP","CP","CP","CP"]],
    ["No hay productos disponibles para esta región.",["No products are available for this region.","Não há produtos disponíveis para esta região.","Aucun produit n’est disponible pour cette région.","Für diese Region sind keine Produkte verfügbar.","Non ci sono prodotti disponibili per questa regione.","Для этого региона нет доступных товаров.","此地区没有可用商品。","この地域では利用可能な商品がありません。","لا توجد منتجات متاحة لهذه المنطقة."]],
    ["No hay productos disponibles en este momento. Vuelve a intentarlo más tarde.",["No products are available right now. Please try again later.","Não há produtos disponíveis no momento. Tente novamente mais tarde.","Aucun produit n’est disponible pour le moment. Réessayez plus tard.","Derzeit sind keine Produkte verfügbar. Bitte versuche es später erneut.","Al momento non ci sono prodotti disponibili. Riprova più tardi.","Сейчас нет доступных товаров. Попробуйте позже.","目前没有可用商品，请稍后重试。","現在利用可能な商品はありません。後でもう一度お試しください。","لا توجد منتجات متاحة حاليًا. حاول مرة أخرى لاحقًا."]],
    ["No pudimos cargar el catálogo. Comprueba tu conexión e inténtalo de nuevo.",["We couldn't load the catalog. Check your connection and try again.","Não foi possível carregar o catálogo. Verifique sua conexão e tente novamente.","Impossible de charger le catalogue. Vérifiez votre connexion et réessayez.","Der Katalog konnte nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.","Impossibile caricare il catalogo. Controlla la connessione e riprova.","Не удалось загрузить каталог. Проверьте подключение и попробуйте снова.","无法加载目录。请检查网络连接后重试。","カタログを読み込めませんでした。接続を確認して再試行してください。","تعذر تحميل الكتالوج. تحقق من اتصالك وحاول مرة أخرى."]],
    ["No se pudieron cargar las regiones.",["Couldn't load regions.","Não foi possível carregar as regiões.","Impossible de charger les régions.","Regionen konnten nicht geladen werden.","Impossibile caricare le regioni.","Не удалось загрузить регионы.","无法加载地区。","地域を読み込めませんでした。","تعذر تحميل المناطق."]],
    ["Reintentar",["Try again","Tentar novamente","Réessayer","Erneut versuchen","Riprova","Повторить","重试","再試行","إعادة المحاولة"]],
    ["Selecciona una región para cargar sus productos.",["Select a region to load its products.","Selecione uma região para carregar os produtos.","Sélectionnez une région pour charger ses produits.","Wähle eine Region, um ihre Produkte zu laden.","Seleziona una regione per caricare i prodotti.","Выберите регион, чтобы загрузить товары.","选择地区以加载商品。","商品を読み込む地域を選択してください。","اختر منطقة لتحميل منتجاتها."]],
    ["Iniciar sesión — INTERNACIONAL WEB",["Sign in — INTERNACIONAL WEB","Entrar — INTERNACIONAL WEB","Connexion — INTERNACIONAL WEB","Anmelden — INTERNACIONAL WEB","Accedi — INTERNACIONAL WEB","Вход — INTERNACIONAL WEB","登录 — INTERNACIONAL WEB","ログイン — INTERNACIONAL WEB","تسجيل الدخول — INTERNACIONAL WEB"]],
    ["CREAR CUENTA",["CREATE ACCOUNT","CRIAR CONTA","CRÉER UN COMPTE","KONTO ERSTELLEN","CREA ACCOUNT","СОЗДАТЬ АККАУНТ","创建账户","アカウント作成","إنشاء حساب"]],
    ["INICIAR SESIÓN",["SIGN IN","ENTRAR","SE CONNECTER","ANMELDEN","ACCEDI","ВОЙТИ","登录","ログイン","تسجيل الدخول"]],
    ["O CONTINÚA CON",["OR CONTINUE WITH","OU CONTINUE COM","OU CONTINUER AVEC","ODER WEITER MIT","OPPURE CONTINUA CON","ИЛИ ПРОДОЛЖИТЬ С","或使用以下方式继续","または次で続行","أو المتابعة باستخدام"]],
    ["Sin recargas todavía",["No top-ups yet","Ainda não há recargas","Aucune recharge pour le moment","Noch keine Aufladungen","Nessuna ricarica","Пополнений пока нет","暂无充值记录","チャージ履歴はまだありません","لا توجد عمليات شحن بعد"]],
    ["No disponible",["Unavailable","Indisponível","Indisponible","Nicht verfügbar","Non disponibile","Недоступно","不可用","利用不可","غير متاح"]],
    ["Actualizar contraseña",["Update password","Atualizar senha","Mettre à jour le mot de passe","Passwort aktualisieren","Aggiorna password","Обновить пароль","更新密码","パスワードを更新","تحديث كلمة المرور"]],
    ["CONFIRMAR Y ACTIVAR",["CONFIRM AND ENABLE","CONFIRMAR E ATIVAR","CONFIRMER ET ACTIVER","BESTÄTIGEN UND AKTIVIEREN","CONFERMA E ATTIVA","ПОДТВЕРДИТЬ И ВКЛЮЧИТЬ","确认并启用","確認して有効化","تأكيد وتفعيل"]],
    ["DESACTIVAR",["DISABLE","DESATIVAR","DÉSACTIVER","DEAKTIVIEREN","DISATTIVA","ОТКЛЮЧИТЬ","停用","無効にする","تعطيل"]],
    ["ACTIVAR APP DE CÓDIGOS",["ENABLE AUTHENTICATOR APP","ATIVAR APP DE CÓDIGOS","ACTIVER L’APPLICATION D’AUTHENTIFICATION","AUTHENTICATOR-APP AKTIVIEREN","ATTIVA APP DI AUTENTICAZIONE","ВКЛЮЧИТЬ ПРИЛОЖЕНИЕ-КОДЫ","启用验证器应用","認証アプリを有効化","تفعيل تطبيق المصادقة"]],
    ["Centro de ayuda",["Help center","Central de ajuda","Centre d’aide","Hilfezentrum","Centro assistenza","Центр помощи","帮助中心","ヘルプセンター","مركز المساعدة"]],
    ["Mis tickets",["My tickets","Meus chamados","Mes tickets","Meine Tickets","I miei ticket","Мои обращения","我的工单","マイチケット","تذاكري"]],
    ["Cargando tickets…",["Loading tickets…","Carregando chamados…","Chargement des tickets…","Tickets werden geladen…","Caricamento ticket…","Загрузка обращений…","正在加载工单…","チケットを読み込み中…","جارٍ تحميل التذاكر…"]],
    ["Enviar",["Send","Enviar","Envoyer","Senden","Invia","Отправить","发送","送信","إرسال"]],
    ["Cuenta",["Account","Conta","Compte","Konto","Account","Аккаунт","账户","アカウント","الحساب"]],
    ["Copiar",["Copy","Copiar","Copier","Kopieren","Copia","Копировать","复制","コピー","نسخ"]],
    ["No hay productos disponibles para este juego.",["No products are available for this game.","Não há produtos disponíveis para este jogo.","Aucun produit n’est disponible pour ce jeu.","Für dieses Spiel sind keine Produkte verfügbar.","Non ci sono prodotti disponibili per questo gioco.","Для этой игры нет доступных товаров.","此游戏暂无可用商品。","このゲームには利用可能な商品がありません。","لا توجد منتجات متاحة لهذه اللعبة."]],
    ["PAGO CONFIRMADO",["PAYMENT CONFIRMED","PAGAMENTO CONFIRMADO","PAIEMENT CONFIRMÉ","ZAHLUNG BESTÄTIGT","PAGAMENTO CONFERMATO","ПЛАТЕЖ ПОДТВЕРЖДЕН","付款已确认","支払い確認済み","تم تأكيد الدفع"]],
    ["Recarga, juega sin límites",["Top up, play without limits","Recarregue, jogue sem limites","Rechargez, jouez sans limites","Aufladen, spielen ohne Grenzen","Ricarica, gioca senza limiti","Пополняй, играй без ограничений","充值畅玩，无拘无束","チャージして、思いきりプレイ","اشحن والعب بلا حدود"]],
    ["Explorar Tienda",["Explore Store","Explorar loja","Explorer la boutique","Shop entdecken","Esplora il negozio","Перейти в магазин","浏览商店","ストアを見る","استكشف المتجر"]],
    ["Nuestros Juegos",["Our Games","Nossos jogos","Nos jeux","Unsere Spiele","I nostri giochi","Наши игры","我们的游戏","ゲーム一覧","ألعابنا"]],
    ["Recargas instantáneas para tus juegos favoritos",["Instant top-ups for your favorite games","Recargas instantâneas para seus jogos favoritos","Recharges instantanées pour vos jeux préférés","Sofortige Aufladungen für deine Lieblingsspiele","Ricariche istantanee per i tuoi giochi preferiti","Мгновенное пополнение любимых игр","为你喜爱的游戏即时充值","お気に入りのゲームに即時チャージ","شحن فوري لألعابك المفضلة"]],
    ["Ver todos",["View all","Ver todos","Tout voir","Alle anzeigen","Vedi tutti","Смотреть все","查看全部","すべて表示","عرض الكل"]],
    ["Todos",["All","Todos","Tout","Alle","Tutti","Все","全部","すべて","الكل"]],
    ["Móvil",["Mobile","Celular","Mobile","Mobil","Mobile","Мобильные","手机","モバイル","الهاتف المحمول"]],
    ["Gift cards",["Gift cards","Cartões-presente","Cartes cadeaux","Geschenkkarten","Carte regalo","Подарочные карты","礼品卡","ギフトカード","بطاقات الهدايا"]],
    ["Tarjetas de regalo",["Gift cards","Cartões-presente","Cartes cadeaux","Geschenkkarten","Carte regalo","Подарочные карты","礼品卡","ギフトカード","بطاقات الهدايا"]],
    ["Servicios",["Services","Serviços","Services","Dienstleistungen","Servizi","Услуги","服务","サービス","الخدمات"]],
    ["Esta categoría todavía no tiene productos publicados.",["This category has no published products yet.","Esta categoria ainda não tem produtos publicados.","Cette catégorie ne contient pas encore de produits publiés.","In dieser Kategorie wurden noch keine Produkte veröffentlicht.","Questa categoria non ha ancora prodotti pubblicati.","В этой категории пока нет опубликованных товаров.","此类别尚未发布商品。","このカテゴリーにはまだ商品がありません。","لا توجد منتجات منشورة في هذه الفئة حتى الآن."]],
    ["1. Selecciona la región",["1. Select region","1. Selecione a região","1. Sélectionnez la région","1. Region auswählen","1. Seleziona la regione","1. Выберите регион","1. 选择地区","1. 地域を選択","1. اختر المنطقة"]],
    ["2. Correo de entrega",["2. Delivery email","2. E-mail de entrega","2. E-mail de livraison","2. E-Mail für Zustellung","2. E-mail di consegna","2. Почта для доставки","2. 收件邮箱","2. お届け先メール","2. بريد التسليم"]],
    ["3. Elige el importe",["3. Choose amount","3. Escolha o valor","3. Choisissez le montant","3. Betrag auswählen","3. Scegli l’importo","3. Выберите сумму","3. 选择金额","3. 金額を選択","3. اختر المبلغ"]],
    ["Cargando tarjetas Steam disponibles...",["Loading available Steam cards...","Carregando cartões Steam disponíveis...","Chargement des cartes Steam disponibles...","Verfügbare Steam-Karten werden geladen...","Caricamento delle carte Steam disponibili...","Загрузка доступных карт Steam...","正在加载可用 Steam 卡...","利用可能なSteamカードを読み込み中...","جارٍ تحميل بطاقات Steam المتاحة..."]],
    ["Cargando tarjetas Google Play disponibles...",["Loading available Google Play cards...","Carregando cartões Google Play disponíveis...","Chargement des cartes Google Play disponibles...","Verfügbare Google Play-Karten werden geladen...","Caricamento delle carte Google Play disponibili...","Загрузка доступных карт Google Play...","正在加载可用 Google Play 卡...","利用可能なGoogle Playカードを読み込み中...","جارٍ تحميل بطاقات Google Play المتاحة..."]],
    ["Cargando tarjetas PlayStation disponibles...",["Loading available PlayStation cards...","Carregando cartões PlayStation disponíveis...","Chargement des cartes PlayStation disponibles...","Verfügbare PlayStation-Karten werden geladen...","Caricamento delle carte PlayStation disponibili...","Загрузка доступных карт PlayStation...","正在加载可用 PlayStation 卡...","利用可能なPlayStationカードを読み込み中...","جارٍ تحميل بطاقات PlayStation المتاحة..."]],
    ["Cargando tarjetas Xbox disponibles...",["Loading available Xbox cards...","Carregando cartões Xbox disponíveis...","Chargement des cartes Xbox disponibles...","Verfügbare Xbox-Karten werden geladen...","Caricamento delle carte Xbox disponibili...","Загрузка доступных карт Xbox...","正在加载可用 Xbox 卡...","利用可能なXboxカードを読み込み中...","جارٍ تحميل بطاقات Xbox المتاحة..."]],
    ["Cargando tarjetas Nintendo disponibles...",["Loading available Nintendo cards...","Carregando cartões Nintendo disponíveis...","Chargement des cartes Nintendo disponibles...","Verfügbare Nintendo-Karten werden geladen...","Caricamento delle carte Nintendo disponibili...","Загрузка доступных карт Nintendo...","正在加载可用 Nintendo 卡...","利用可能なNintendoカードを読み込み中...","جارٍ تحميل بطاقات Nintendo المتاحة..."]],
    ["Estamos cargando los datos reales de tu pedido…",["We're loading your actual order details…","Estamos carregando os dados reais do seu pedido…","Nous chargeons les détails réels de votre commande…","Wir laden die tatsächlichen Bestelldaten…","Stiamo caricando i dati reali del tuo ordine…","Загружаем фактические данные заказа…","正在加载订单的实际信息…","注文の実際の詳細を読み込んでいます…","جارٍ تحميل بيانات طلبك الفعلية…"]],
    ["Puedes consultar este pedido en",["You can view this order in","Você pode consultar este pedido em","Vous pouvez consulter cette commande dans","Du kannst diese Bestellung hier einsehen:","Puoi consultare questo ordine in","Вы можете посмотреть этот заказ в разделе","你可以在此处查看此订单","この注文は次の場所で確認できます","يمكنك الاطلاع على هذا الطلب في"]],
    ["Si necesitas ayuda,",["If you need help,","Se precisar de ajuda,","Si vous avez besoin d’aide,","Wenn du Hilfe benötigst,","Se hai bisogno di aiuto,","Если вам нужна помощь,","如果你需要帮助，","サポートが必要な場合は、","إذا كنت بحاجة إلى مساعدة،"]],
    ["contacta con soporte",["contact support","entre em contato com o suporte","contactez le support","wende dich an den Support","contatta l’assistenza","обратитесь в поддержку","联系客户支持","サポートにお問い合わせください","تواصل مع الدعم"]],
    ["No pudimos cargar tu pedido",["We couldn't load your order","Não foi possível carregar seu pedido","Impossible de charger votre commande","Deine Bestellung konnte nicht geladen werden","Impossibile caricare il tuo ordine","Не удалось загрузить ваш заказ","无法加载你的订单","注文を読み込めませんでした","تعذر تحميل طلبك"]],
    ["Comprueba tu conexión e inténtalo de nuevo.",["Check your connection and try again.","Verifique sua conexão e tente novamente.","Vérifiez votre connexion et réessayez.","Prüfe deine Verbindung und versuche es erneut.","Controlla la connessione e riprova.","Проверьте подключение и попробуйте снова.","请检查网络连接后重试。","接続を確認して再試行してください。","تحقق من اتصالك وحاول مرة أخرى."]],
    ["No hay recargas todavía",["No top-ups yet","Ainda não há recargas","Aucune recharge pour le moment","Noch keine Aufladungen","Nessuna ricarica","Пополнений пока нет","暂无充值记录","チャージ履歴はまだありません","لا توجد عمليات شحن بعد"]],
    ["Aquí aparecerán tus compras y recargas de juegos cuando realices una.",["Your purchases and game top-ups will appear here once you make one.","Suas compras e recargas de jogos aparecerão aqui quando você fizer uma.","Vos achats et recharges de jeux apparaîtront ici après votre première opération.","Deine Käufe und Spielaufladungen erscheinen hier, sobald du einen Kauf tätigst.","I tuoi acquisti e le ricariche dei giochi appariranno qui dopo il primo acquisto.","Здесь будут отображаться ваши покупки и игровые пополнения.","完成购买后，你的订单和游戏充值记录会显示在这里。","購入すると、ここに購入履歴とゲームチャージが表示されます。","ستظهر مشترياتك وعمليات شحن الألعاب هنا بعد تنفيذ أول عملية."]],
    ["Sin depósitos todavía",["No deposits yet","Ainda não há depósitos","Aucun dépôt pour le moment","Noch keine Einzahlungen","Nessun deposito","Пополнений баланса пока нет","暂无充值记录","入金履歴はまだありません","لا توجد إيداعات بعد"]],
    ["Aquí encontrarás el historial de tus depósitos y movimientos de USDT.",["Here you'll find your USDT deposit and transaction history.","Aqui você encontrará o histórico de depósitos e movimentações de USDT.","Vous trouverez ici l’historique de vos dépôts et mouvements en USDT.","Hier findest du den Verlauf deiner USDT-Einzahlungen und Transaktionen.","Qui troverai la cronologia dei depositi e dei movimenti USDT.","Здесь будет история ваших депозитов и операций с USDT.","你可以在这里查看 USDT 充值和交易记录。","ここでUSDTの入金と取引履歴を確認できます。","ستجد هنا سجل إيداعاتك وحركات USDT."]],
    ["Información de tu perfil",["Your profile information","Informações do seu perfil","Informations de votre profil","Deine Profilinformationen","Informazioni del tuo profilo","Информация о вашем профиле","你的个人资料信息","プロフィール情報","معلومات ملفك الشخصي"]],
    ["Estos datos identifican tu cuenta",["These details identify your account","Esses dados identificam sua conta","Ces informations identifient votre compte","Diese Daten identifizieren dein Konto","Questi dati identificano il tuo account","Эти данные идентифицируют ваш аккаунт","这些信息用于识别你的账户","これらの情報はアカウントを識別します","تُعرّف هذه البيانات حسابك"]],
    ["Elige qué avisos quieres recibir en tu teléfono",["Choose which alerts you want to receive on your phone","Escolha quais avisos deseja receber no seu telefone","Choisissez les alertes que vous souhaitez recevoir sur votre téléphone","Wähle aus, welche Benachrichtigungen du auf deinem Telefon erhalten möchtest","Scegli quali avvisi vuoi ricevere sul telefono","Выберите уведомления, которые хотите получать на телефон","选择你希望在手机上接收的提醒","スマートフォンで受け取る通知を選択してください","اختر التنبيهات التي تريد تلقيها على هاتفك"]],
    ["Comprueba los dispositivos donde has iniciado sesión",["Review the devices where you're signed in","Confira os dispositivos em que você iniciou sessão","Vérifiez les appareils sur lesquels vous êtes connecté","Überprüfe die Geräte, auf denen du angemeldet bist","Controlla i dispositivi su cui hai effettuato l’accesso","Проверьте устройства, на которых выполнен вход","查看已登录的设备","ログイン中のデバイスを確認","راجع الأجهزة التي سجلت الدخول منها"]],
    ["¡Tus recompensas te esperan!",["Your rewards are waiting!","Suas recompensas estão esperando!","Vos récompenses vous attendent !","Deine Prämien warten auf dich!","I tuoi premi ti aspettano!","Ваши награды ждут вас!","你的奖励正在等你！","報酬があなたを待っています！","مكافآتك بانتظارك!"]],
    ["Comparte tu enlace e invita amigos para ganar recompensas.",["Share your link and invite friends to earn rewards.","Compartilhe seu link e convide amigos para ganhar recompensas.","Partagez votre lien et invitez des amis pour gagner des récompenses.","Teile deinen Link und lade Freunde ein, um Prämien zu erhalten.","Condividi il link e invita gli amici per ottenere premi.","Делитесь ссылкой и приглашайте друзей, чтобы получать награды.","分享链接并邀请好友赚取奖励。","リンクを共有して友達を招待し、報酬を獲得しましょう。","شارك رابطك وادعُ أصدقاءك لكسب المكافآت."]],
    ["＋ Nuevo ticket",["＋ New ticket","＋ Novo chamado","＋ Nouveau ticket","＋ Neues Ticket","＋ Nuovo ticket","＋ Новое обращение","＋ 新建工单","＋ 新しいチケット","＋ تذكرة جديدة"]],
    ["Tu satisfacción es nuestra prioridad",["Your satisfaction is our priority","Sua satisfação é nossa prioridade","Votre satisfaction est notre priorité","Deine Zufriedenheit hat für uns Priorität","La tua soddisfazione è la nostra priorità","Ваше удовлетворение — наш приоритет","您的满意是我们的首要任务","お客様の満足が私たちの最優先事項です","رضاك هو أولويتنا"]],
    ["Preguntas frecuentes",["Frequently asked questions","Perguntas frequentes","Questions fréquentes","Häufig gestellte Fragen","Domande frequenti","Часто задаваемые вопросы","常见问题","よくある質問","الأسئلة الشائعة"]],
    ["¿Cómo puedo contactar al equipo de soporte?",["How can I contact the support team?","Como posso entrar em contato com a equipe de suporte?","Comment puis-je contacter l’équipe d’assistance ?","Wie kann ich das Support-Team kontaktieren?","Come posso contattare il team di assistenza?","Как связаться со службой поддержки?","如何联系客户支持团队？","サポートチームに連絡するにはどうすればよいですか？","كيف يمكنني التواصل مع فريق الدعم؟"]],
    ["¿Dónde puedo consultar mis compras?",["Where can I view my purchases?","Onde posso consultar minhas compras?","Où puis-je consulter mes achats ?","Wo kann ich meine Käufe einsehen?","Dove posso consultare i miei acquisti?","Где я могу посмотреть свои покупки?","在哪里可以查看我的订单？","購入履歴はどこで確認できますか？","أين يمكنني الاطلاع على مشترياتي؟"]],
    ["Programa de referidos",["Referral program","Programa de indicações","Programme de parrainage","Empfehlungsprogramm","Programma referral","Реферальная программа","推荐计划","紹介プログラム","برنامج الإحالة"]],
    ["Gana el 5% de la primera compra",["Earn 5% from the first purchase","Ganhe 5% da primeira compra","Gagnez 5 % sur le premier achat","Verdiene 5 % beim ersten Kauf","Guadagna il 5% sul primo acquisto","Получите 5% от первой покупки","从首次购买中赚取 5%","初回購入の5%を獲得","اكسب 5٪ من أول عملية شراء"]],
    ["COPIAR",["COPY","COPIAR","COPIER","KOPIEREN","COPIA","КОПИРОВАТЬ","复制","コピー","نسخ"]],
    ["Cargando tus referidos...",["Loading your referrals...","Carregando suas indicações...","Chargement de vos filleuls...","Deine Empfehlungen werden geladen...","Caricamento dei tuoi referral...","Загрузка ваших приглашений...","正在加载你的推荐记录...","紹介情報を読み込み中...","جارٍ تحميل إحالاتك..."]],
    ["TU PERFIL",["YOUR PROFILE","SEU PERFIL","VOTRE PROFIL","DEIN PROFIL","IL TUO PROFILO","ВАШ ПРОФИЛЬ","个人资料","プロフィール","ملفك الشخصي"]],
    ["CONFIGURACIÓN",["SETTINGS","CONFIGURAÇÕES","PARAMÈTRES","EINSTELLUNGEN","IMPOSTAZIONI","НАСТРОЙКИ","设置","設定","الإعدادات"]],
    ["DATOS PERSONALES",["PERSONAL DETAILS","DADOS PESSOAIS","DONNÉES PERSONNELLES","PERSÖNLICHE DATEN","DATI PERSONALI","ЛИЧНЫЕ ДАННЫЕ","个人资料","個人情報","البيانات الشخصية"]],
    ["MÉTODOS DE ACCESO",["LOGIN METHODS","MÉTODOS DE ACESSO","MÉTHODES DE CONNEXION","ANMELDEMETHODEN","METODI DI ACCESSO","СПОСОБЫ ВХОДА","登录方式","ログイン方法","طرق تسجيل الدخول"]],
    ["SEGURIDAD",["SECURITY","SEGURANÇA","SÉCURITÉ","SICHERHEIT","SICUREZZA","БЕЗОПАСНОСТЬ","安全","セキュリティ","الأمان"]],
    ["MIS COMPRAS",["MY PURCHASES","MINHAS COMPRAS","MES ACHATS","MEINE KÄUFE","I MIEI ACQUISTI","МОИ ПОКУПКИ","我的订单","購入履歴","مشترياتي"]],
    ["MIS RECOMPENSAS",["MY REWARDS","MINHAS RECOMPENSAS","MES RÉCOMPENSES","MEINE PRÄMIEN","I MIEI PREMI","МОИ НАГРАДЫ","我的奖励","マイ報酬","مكافآتي"]],
    ["NOTIFICACIONES",["NOTIFICATIONS","NOTIFICAÇÕES","NOTIFICATIONS","BENACHRICHTIGUNGEN","NOTIFICHE","УВЕДОМЛЕНИЯ","通知","通知","الإشعارات"]],
    ["SOPORTE",["SUPPORT","SUPORTE","ASSISTANCE","SUPPORT","ASSISTENZA","ПОДДЕРЖКА","客服支持","サポート","الدعم"]],
    ["MIS INVITADOS",["MY REFERRALS","MEUS CONVIDADOS","MES FILLEULS","MEINE EMPFEHLUNGEN","I MIEI INVITATI","МОИ ПРИГЛАШЕННЫЕ","我的邀请","招待した友達","المدعوون لدي"]],
    ["TU ENLACE PERSONAL",["YOUR PERSONAL LINK","SEU LINK PESSOAL","VOTRE LIEN PERSONNEL","DEIN PERSÖNLICHER LINK","IL TUO LINK PERSONALE","ВАША ЛИЧНАЯ ССЫЛКА","你的专属链接","あなた専用リンク","رابطك الشخصي"]],
    ["¿CÓMO FUNCIONA?",["HOW DOES IT WORK?","COMO FUNCIONA?","COMMENT ÇA MARCHE ?","WIE FUNKTIONIERT ES?","COME FUNZIONA?","КАК ЭТО РАБОТАЕТ?","如何运作？","仕組みは？","كيف يعمل؟"]],
    ["Comparte tu enlace.",["Share your link.","Compartilhe seu link.","Partagez votre lien.","Teile deinen Link.","Condividi il tuo link.","Поделитесь ссылкой.","分享你的链接。","リンクを共有しましょう。","شارك رابطك."]],
    ["Tu amigo realiza su primera compra.",["Your friend makes their first purchase.","Seu amigo faz a primeira compra.","Votre ami effectue son premier achat.","Dein Freund tätigt seinen ersten Kauf.","Il tuo amico effettua il primo acquisto.","Ваш друг совершает первую покупку.","好友完成首次购买。","友達が初めて購入します。","يجري صديقك أول عملية شراء."]],
    ["Recibe tu 5%.",["Receive your 5%.","Receba seus 5%.","Recevez vos 5 %.","Erhalte deine 5 %.","Ricevi il tuo 5%.","Получите свои 5%.","获得你的 5%。","5%を受け取りましょう。","احصل على نسبة 5٪."]],
    ["Cargando catálogo...",["Loading catalog...","Carregando catálogo...","Chargement du catalogue...","Katalog wird geladen...","Caricamento catalogo...","Загрузка каталога...","正在加载目录...","カタログを読み込み中...","جارٍ تحميل الكتالوج..."]],
    ["Cargando productos...",["Loading products...","Carregando produtos...","Chargement des produits...","Produkte werden geladen...","Caricamento prodotti...","Загрузка товаров...","正在加载商品...","商品を読み込み中...","جارٍ تحميل المنتجات..."]],
    ["No hay productos disponibles.",["No products available.","Não há produtos disponíveis.","Aucun produit disponible.","Keine Produkte verfügbar.","Nessun prodotto disponibile.","Нет доступных товаров.","暂无可用商品。","利用可能な商品はありません。","لا توجد منتجات متاحة."]],
    ["Precio no disponible",["Price unavailable","Preço indisponível","Prix indisponible","Preis nicht verfügbar","Prezzo non disponibile","Цена недоступна","价格不可用","価格を利用できません","السعر غير متاح"]],
    ["Nickname verificado",["Nickname verified","Nickname verificado","Pseudo vérifié","Nickname verifiziert","Nickname verificato","Никнейм подтвержден","昵称已验证","ニックネーム確認済み","تم التحقق من اسم المستخدم"]],
    ["Verificando nickname...",["Verifying nickname...","Verificando nickname...","Vérification du pseudo...","Nickname wird überprüft...","Verifica del nickname...","Проверка никнейма...","正在验证昵称...","ニックネームを確認中...","جارٍ التحقق من اسم المستخدم..."]],
    ["Selecciona la región para ver los productos disponibles",["Select a region to view available products","Selecione uma região para ver os produtos disponíveis","Sélectionnez une région pour voir les produits disponibles","Wähle eine Region, um verfügbare Produkte anzuzeigen","Seleziona una regione per vedere i prodotti disponibili","Выберите регион, чтобы увидеть доступные товары","选择地区以查看可用商品","利用可能な商品を表示する地域を選択してください","اختر منطقة لعرض المنتجات المتاحة"]],
    ["No pudimos cargar las tarjetas Google Play. Comprueba tu conexión e inténtalo de nuevo.",["We couldn't load Google Play cards. Check your connection and try again.","Não foi possível carregar os cartões Google Play. Verifique sua conexão e tente novamente.","Impossible de charger les cartes Google Play. Vérifiez votre connexion et réessayez.","Google Play-Karten konnten nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.","Impossibile caricare le carte Google Play. Controlla la connessione e riprova.","Не удалось загрузить карты Google Play. Проверьте подключение и попробуйте снова.","无法加载 Google Play 卡。请检查网络连接后重试。","Google Playカードを読み込めませんでした。接続を確認して再試行してください。","تعذر تحميل بطاقات Google Play. تحقق من اتصالك وحاول مرة أخرى."]],
    ["No pudimos cargar las tarjetas PlayStation. Comprueba tu conexión e inténtalo de nuevo.",["We couldn't load PlayStation cards. Check your connection and try again.","Não foi possível carregar os cartões PlayStation. Verifique sua conexão e tente novamente.","Impossible de charger les cartes PlayStation. Vérifiez votre connexion et réessayez.","PlayStation-Karten konnten nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.","Impossibile caricare le carte PlayStation. Controlla la connessione e riprova.","Не удалось загрузить карты PlayStation. Проверьте подключение и попробуйте снова.","无法加载 PlayStation 卡。请检查网络连接后重试。","PlayStationカードを読み込めませんでした。接続を確認して再試行してください。","تعذر تحميل بطاقات PlayStation. تحقق من اتصالك وحاول مرة أخرى."]],
    ["No pudimos cargar las tarjetas Xbox. Comprueba tu conexión e inténtalo de nuevo.",["We couldn't load Xbox cards. Check your connection and try again.","Não foi possível carregar os cartões Xbox. Verifique sua conexão e tente novamente.","Impossible de charger les cartes Xbox. Vérifiez votre connexion et réessayez.","Xbox-Karten konnten nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.","Impossibile caricare le carte Xbox. Controlla la connessione e riprova.","Не удалось загрузить карты Xbox. Проверьте подключение и попробуйте снова.","无法加载 Xbox 卡。请检查网络连接后重试。","Xboxカードを読み込めませんでした。接続を確認して再試行してください。","تعذر تحميل بطاقات Xbox. تحقق من اتصالك وحاول مرة أخرى."]],
    ["No pudimos cargar las tarjetas Nintendo. Comprueba tu conexión e inténtalo de nuevo.",["We couldn't load Nintendo cards. Check your connection and try again.","Não foi possível carregar os cartões Nintendo. Verifique sua conexão e tente novamente.","Impossible de charger les cartes Nintendo. Vérifiez votre connexion et réessayez.","Nintendo-Karten konnten nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.","Impossibile caricare le carte Nintendo. Controlla la connessione e riprova.","Не удалось загрузить карты Nintendo. Проверьте подключение и попробуйте снова.","无法加载 Nintendo 卡。请检查网络连接后重试。","Nintendoカードを読み込めませんでした。接続を確認して再試行してください。","تعذر تحميل بطاقات Nintendo. تحقق من اتصالك وحاول مرة أخرى."]],
    ["No pudimos cargar las tarjetas Steam. Comprueba tu conexión e inténtalo de nuevo.",["We couldn't load Steam cards. Check your connection and try again.","Não foi possível carregar os cartões Steam. Verifique sua conexão e tente novamente.","Impossible de charger les cartes Steam. Vérifiez votre connexion et réessayez.","Steam-Karten konnten nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.","Impossibile caricare le carte Steam. Controlla la connessione e riprova.","Не удалось загрузить карты Steam. Проверьте подключение и попробуйте снова.","无法加载 Steam 卡。请检查网络连接后重试。","Steamカードを読み込めませんでした。接続を確認して再試行してください。","تعذر تحميل بطاقات Steam. تحقق من اتصالك وحاول مرة أخرى."]],
    ["Canal de WhatsApp",["WhatsApp channel","Canal do WhatsApp","Canal WhatsApp","WhatsApp-Kanal","Canale WhatsApp","Канал WhatsApp","WhatsApp 频道","WhatsAppチャンネル","قناة واتساب"]],
    ["Canal de Telegram",["Telegram channel","Canal do Telegram","Canal Telegram","Telegram-Kanal","Canale Telegram","Канал Telegram","Telegram 频道","Telegramチャンネル","قناة تيليجرام"]],
    ["Explorar tienda ↗",["Explore store ↗","Explorar loja ↗","Explorer la boutique ↗","Shop entdecken ↗","Esplora il negozio ↗","Перейти в магазин ↗","浏览商店 ↗","ストアを見る ↗","استكشف المتجر ↗"]],
    ["Tu próxima partida empieza aquí",["Your next match starts here","Sua próxima partida começa aqui","Votre prochaine partie commence ici","Dein nächstes Match beginnt hier","La tua prossima partita inizia qui","Твоя следующая игра начинается здесь","你的下一场对局从这里开始","次のゲームはここから始まる","مباراتك القادمة تبدأ من هنا"]],
    ["Una plataforma pensada para que recargar sea tan sencillo como entrar a tu juego favorito.",["A platform designed to make topping up as easy as opening your favorite game.","Uma plataforma pensada para tornar a recarga tão simples quanto abrir seu jogo favorito.","Une plateforme conçue pour rendre la recharge aussi simple que de lancer votre jeu préféré.","Eine Plattform, auf der Aufladen so einfach ist wie das Öffnen deines Lieblingsspiels.","Una piattaforma pensata per rendere la ricarica semplice come aprire il tuo gioco preferito.","Платформа, где пополнение так же просто, как запуск любимой игры.","让充值像打开你最喜欢的游戏一样简单的平台。","お気に入りのゲームを開くのと同じくらい簡単にチャージできるプラットフォーム。","منصة تجعل الشحن سهلاً مثل فتح لعبتك المفضلة."]],
    ["Una experiencia ágil",["A seamless experience","Uma experiência ágil","Une expérience fluide","Ein reibungsloses Erlebnis","Un’esperienza fluida","Удобный процесс","流畅体验","スムーズな体験","تجربة سلسة"]],
    ["Diseñado para el mundo",["Designed for the world","Feito para o mundo","Conçu pour le monde","Für die Welt entwickelt","Progettato per il mondo","Создано для всего мира","为世界而设计","世界に向けて設計","مصمم للعالم"]],
    ["Rápido, seguro y global",["Fast, secure and global","Rápido, seguro e global","Rapide, sécurisé et mondial","Schnell, sicher und global","Veloce, sicuro e globale","Быстро, безопасно и глобально","快速、安全、全球化","高速・安全・グローバル","سريع وآمن وعالمي"]],
    ["POR QUÉ ELEGIRNOS",["WHY CHOOSE US","POR QUE NOS ESCOLHER","POURQUOI NOUS CHOISIR","WARUM WIR","PERCHÉ SCEGLIERCI","ПОЧЕМУ ВЫБИРАЮТ НАС","为什么选择我们","選ばれる理由","لماذا تختارنا"]],
    ["ELIGE TU PARTIDA",["CHOOSE YOUR GAME","ESCOLHA SEU JOGO","CHOISISSEZ VOTRE JEU","WÄHLE DEIN SPIEL","SCEGLI IL TUO GIOCO","ВЫБЕРИ СВОЮ ИГРУ","选择你的游戏","ゲームを選択","اختر لعبتك"]],
    ["RECARGA, JUEGA SIN LÍMITES",["TOP UP, PLAY WITHOUT LIMITS","RECARREGUE, JOGUE SEM LIMITES","RECHARGEZ, JOUEZ SANS LIMITES","AUFLADEN, SPIELEN OHNE GRENZEN","RICARICA, GIOCA SENZA LIMITI","ПОПОЛНЯЙ, ИГРАЙ БЕЗ ОГРАНИЧЕНИЙ","充值畅玩，无拘无束","チャージして、思いきりプレイ","اشحن والعب بلا حدود"]],
    ["Tu plataforma global de recargas gaming.",["Your global gaming top-up platform.","Sua plataforma global de recargas para jogos.","Votre plateforme mondiale de recharge gaming.","Deine globale Plattform für Gaming-Aufladungen.","La tua piattaforma globale di ricariche gaming.","Глобальная платформа игровых пополнений.","全球游戏充值平台。","グローバルなゲームチャージプラットフォーム。","منصتك العالمية لشحن الألعاب."]],
    ["Novedades y avisos importantes",["News and important updates","Novidades e avisos importantes","Actualités et annonces importantes","Neuigkeiten und wichtige Hinweise","Novità e avvisi importanti","Новости и важные объявления","最新消息和重要通知","お知らせと重要な更新","الأخبار والتنبيهات المهمة"]],
    ["Comunidad y actualizaciones",["Community and updates","Comunidade e atualizações","Communauté et mises à jour","Community und Updates","Community e aggiornamenti","Сообщество и обновления","社区与更新","コミュニティと更新情報","المجتمع والتحديثات"]],
    ["Elige tu canal y mantente al día",["Choose your channel and stay up to date","Escolha seu canal e fique por dentro","Choisissez votre canal et restez informé","Wähle deinen Kanal und bleib auf dem Laufenden","Scegli il tuo canale e resta aggiornato","Выберите канал и будьте в курсе","选择频道，及时了解最新动态","チャンネルを選んで最新情報をチェック","اختر قناتك وابق على اطلاع"]],
    ["Conoce la plataforma",["Discover the platform","Conheça a plataforma","Découvrez la plateforme","Lerne die Plattform kennen","Scopri la piattaforma","Познакомьтесь с платформой","了解平台","プラットフォームを見る","اكتشف المنصة"]],
    ["Todo lo que necesitas para seguir jugando.",["Everything you need to keep playing.","Tudo o que você precisa para continuar jogando.","Tout ce dont vous avez besoin pour continuer à jouer.","Alles, was du zum Weiterspielen brauchst.","Tutto ciò che ti serve per continuare a giocare.","Всё необходимое, чтобы продолжать играть.","继续畅玩的所需一切。","ゲームを続けるために必要なものがすべて。","كل ما تحتاجه لمواصلة اللعب."]],
    ["Encuentra tu juego y prepárate para el siguiente nivel.",["Find your game and get ready for the next level.","Encontre seu jogo e prepare-se para o próximo nível.","Trouvez votre jeu et préparez-vous pour le niveau suivant.","Finde dein Spiel und mach dich bereit für das nächste Level.","Trova il tuo gioco e preparati per il livello successivo.","Найдите свою игру и приготовьтесь к следующему уровню.","找到你的游戏，准备迎接下一个等级。","ゲームを見つけて、次のレベルに備えましょう。","اعثر على لعبتك واستعد للمستوى التالي."]],
    ["Pagos con",["Payments with","Pagamentos com","Paiements en","Zahlungen mit","Pagamenti con","Оплата через","支持支付","お支払い方法","الدفع باستخدام"]],
    ["Precios",["Competitive","Preços","Prix","Preise","Prezzi","Цены","价格","価格","الأسعار"]],
    ["competitivos",["competitive","competitivos","compétitifs","wettbewerbsfähig","competitivi","конкурентные","优惠","お得な","تنافسية"]],
    ["API para",["API for","API para","API pour","API für","API per","API для","面向","向けAPI","واجهة API لـ"]],
    ["revendedores",["resellers","revendedores","revendeurs","Wiederverkäufer","rivenditori","реселлеров","分销商","リセラー","الموزعين"]],
    ["Un proceso claro, directo y fácil de seguir desde cualquier dispositivo.",["A clear, straightforward process that's easy to follow on any device.","Um processo claro, direto e fácil de acompanhar em qualquer dispositivo.","Un processus clair, direct et facile à suivre depuis n’importe quel appareil.","Ein klarer, direkter und auf jedem Gerät leicht nachvollziehbarer Ablauf.","Un processo chiaro, diretto e facile da seguire da qualsiasi dispositivo.","Понятный и простой процесс, доступный с любого устройства.","流程清晰直接，可在任何设备上轻松操作。","どのデバイスからでも簡単に進められる、明確でシンプルな手順。","عملية واضحة ومباشرة وسهلة المتابعة من أي جهاز."]],
    ["Una tienda digital con visión internacional y catálogo en expansión.",["A digital store with a global outlook and a growing catalog.","Uma loja digital com visão internacional e catálogo em expansão.","Une boutique numérique à vocation internationale avec un catalogue en expansion.","Ein digitaler Shop mit internationaler Ausrichtung und wachsendem Katalog.","Un negozio digitale con una visione internazionale e un catalogo in crescita.","Цифровой магазин с международным охватом и расширяющимся каталогом.","面向全球、商品目录不断扩展的数字商店。","国際的な視野と拡大を続けるカタログを備えたデジタルストア。","متجر رقمي برؤية عالمية وكتالوج متنامٍ."]],
    ["Una base preparada para futuras integraciones y herramientas para partners.",["A foundation ready for future integrations and partner tools.","Uma base preparada para futuras integrações e ferramentas para parceiros.","Une base prête pour de futures intégrations et des outils partenaires.","Eine Grundlage für zukünftige Integrationen und Partner-Tools.","Una base pronta per future integrazioni e strumenti per i partner.","Основа для будущих интеграций и инструментов партнёров.","为未来集成和合作伙伴工具做好准备的平台基础。","将来の連携やパートナーツールに対応できる基盤。","قاعدة جاهزة للتكاملات المستقبلية وأدوات الشركاء."]],
    ["Estamos preparando herramientas para revendedores y partners que quieran conectar con nuestro ecosistema gaming.",["We're preparing tools for resellers and partners who want to connect with our gaming ecosystem.","Estamos preparando ferramentas para revendedores e parceiros que desejam se conectar ao nosso ecossistema gaming.","Nous préparons des outils pour les revendeurs et partenaires qui souhaitent rejoindre notre écosystème gaming.","Wir entwickeln Tools für Wiederverkäufer und Partner, die sich mit unserem Gaming-Ökosystem verbinden möchten.","Stiamo preparando strumenti per rivenditori e partner che desiderano collegarsi al nostro ecosistema gaming.","Мы готовим инструменты для реселлеров и партнёров, желающих подключиться к нашей игровой экосистеме.","我们正在为希望接入游戏生态的经销商和合作伙伴准备工具。","ゲームエコシステムへの接続を希望するリセラーやパートナー向けのツールを準備しています。","نُعد أدوات للموزعين والشركاء الراغبين في الاتصال بمنظومة الألعاب لدينا."]],
    ["Programa y API en fase de planificación. Próximamente.",["Program and API in planning. Coming soon.","Programa e API em fase de planejamento. Em breve.","Programme et API en cours de planification. Bientôt disponibles.","Programm und API in Planung. Demnächst verfügbar.","Programma e API in fase di pianificazione. Prossimamente.","Программа и API находятся на стадии планирования. Скоро.","计划中的项目和 API，即将推出。","プログラムとAPIを計画中です。近日公開。","البرنامج وواجهة API قيد التخطيط. قريبًا."]],
    ["Mi Cuenta",["My Account","Minha conta","Mon compte","Mein Konto","Il mio account","Мой аккаунт","我的账户","マイアカウント","حسابي"]],
    ["Cambiar foto",["Change photo","Alterar foto","Changer la photo","Foto ändern","Cambia foto","Изменить фото","更换照片","写真を変更","تغيير الصورة"]],
    ["Quitar foto",["Remove photo","Remover foto","Supprimer la photo","Foto entfernen","Rimuovi foto","Удалить фото","移除照片","写真を削除","إزالة الصورة"]],
    ["Saldo disponible",["Available balance","Saldo disponível","Solde disponible","Verfügbares Guthaben","Saldo disponibile","Доступный баланс","可用余额","利用可能残高","الرصيد المتاح"]],
    ["Añadir",["Add","Adicionar","Ajouter","Hinzufügen","Aggiungi","Добавить","添加","追加","إضافة"]],
    ["Datos personales",["Personal details","Dados pessoais","Données personnelles","Persönliche Daten","Dati personali","Личные данные","个人资料","個人情報","البيانات الشخصية"]],
    ["Métodos de acceso",["Login methods","Métodos de acesso","Méthodes de connexion","Anmeldemethoden","Metodi di accesso","Способы входа","登录方式","ログイン方法","طرق تسجيل الدخول"]],
    ["Mis Compras",["My Purchases","Minhas compras","Mes achats","Meine Käufe","I miei acquisti","Мои покупки","我的订单","購入履歴","مشترياتي"]],
    ["Mis Recompensas",["My Rewards","Minhas recompensas","Mes récompenses","Meine Prämien","I miei premi","Мои награды","我的奖励","マイ報酬","مكافآتي"]],
    ["Cerrar sesión",["Log out","Sair","Se déconnecter","Abmelden","Esci","Выйти","退出登录","ログアウト","تسجيل الخروج"]],
    ["Cargando regiones disponibles…",["Loading available regions…","Carregando regiões disponíveis…","Chargement des régions disponibles…","Verfügbare Regionen werden geladen…","Caricamento delle regioni disponibili…","Загрузка доступных регионов…","正在加载可用地区…","利用可能な地域を読み込み中…","جارٍ تحميل المناطق المتاحة…"]],
    ["Cargando regiones...",["Loading regions...","Carregando regiões...","Chargement des régions...","Regionen werden geladen...","Caricamento regioni...","Загрузка регионов...","正在加载地区...","地域を読み込み中...","جارٍ تحميل المناطق..."]],
    ["Tu Player ID",["Your Player ID","Seu Player ID","Votre Player ID","Deine Player-ID","Il tuo Player ID","Ваш Player ID","你的玩家 ID","プレイヤーID","معرّف اللاعب"]],
    ["Tu Character ID",["Your Character ID","Seu Character ID","Votre Character ID","Deine Character-ID","Il tuo Character ID","Ваш Character ID","你的角色 ID","キャラクターID","معرّف الشخصية"]],
    ["Tu UID",["Your UID","Seu UID","Votre UID","Deine UID","Il tuo UID","Ваш UID","你的 UID","UID","معرّف UID"]],
    ["Tu nombre de usuario",["Your username","Seu nome de usuário","Votre nom d’utilisateur","Dein Benutzername","Il tuo nome utente","Ваше имя пользователя","你的用户名","ユーザー名","اسم المستخدم"]],
    ["Región del juego",["Game region","Região do jogo","Région du jeu","Spielregion","Regione del gioco","Регион игры","游戏地区","ゲーム地域","منطقة اللعبة"]],
    ["Diamantes",["Diamonds","Diamantes","Diamants","Diamanten","Diamanti","Алмазы","钻石","ダイヤ","الماس"]],
    ["Cristales Génesis",["Genesis Crystals","Cristais Gênesis","Cristaux primaires","Genesis-Kristalle","Cristalli della Genesi","Кристаллы Сотворения","创世结晶","創世結晶","بلورات التكوين"]],
    ["Tokens",["Tokens","Tokens","Jetons","Tokens","Token","Токены","代币","トークン","رموز"]],
    ["Gold",["Gold","Ouro","Or","Gold","Oro","Золото","金币","ゴールド","الذهب"]],
    ["Robux",["Robux","Robux","Robux","Robux","Robux","Robux","Robux","Robux","Robux"]],
    ["Bonos",["Bonuses","Bônus","Bonus","Boni","Bonus","Бонусы","奖励","ボーナス","المكافآت"]],
    ["Ofertas",["Offers","Ofertas","Offres","Angebote","Offerte","Предложения","优惠","オファー","العروض"]],
    ["Recargar ahora",["Top up now","Recarregar agora","Recharger maintenant","Jetzt aufladen","Ricarica ora","Пополнить сейчас","立即充值","今すぐチャージ","اشحن الآن"]],
    ["Player ID",["Player ID","Player ID","Player ID","Player-ID","Player ID","Player ID","玩家 ID","プレイヤーID","معرّف اللاعب"]],
    ["Código de tu aplicación",["Your app code","Código do seu aplicativo","Code de votre application","App-Code","Codice dell'app","Код из приложения","应用验证码","アプリのコード","رمز التطبيق"]],
    ["VERIFICAR Y CONTINUAR",["VERIFY AND CONTINUE","VERIFICAR E CONTINUAR","VÉRIFIER ET CONTINUER","ÜBERPRÜFEN UND FORTFAHREN","VERIFICA E CONTINUA","ПРОВЕРИТЬ И ПРОДОЛЖИТЬ","验证并继续","確認して続行","تحقق وتابع"]],
    ["El código cambia automáticamente cada pocos segundos. Si no funciona, espera a que aparezca uno nuevo en tu aplicación.",["The code changes automatically every few seconds. If it doesn't work, wait for a new one in your app.","O código muda automaticamente a cada poucos segundos. Se não funcionar, aguarde um novo no aplicativo.","Le code change automatiquement toutes les quelques secondes. S’il ne fonctionne pas, attendez qu’un nouveau apparaisse dans votre application.","Der Code ändert sich automatisch alle paar Sekunden. Wenn er nicht funktioniert, warte auf einen neuen in deiner App.","Il codice cambia automaticamente ogni pochi secondi. Se non funziona, attendi che ne appaia uno nuovo nell'app.","Код автоматически меняется каждые несколько секунд. Если он не работает, дождитесь нового в приложении.","验证码每隔几秒自动变化。如果无法使用，请等待应用中出现新验证码。","コードは数秒ごとに自動更新されます。機能しない場合は、アプリに新しいコードが表示されるまでお待ちください。","يتغير الرمز تلقائيًا كل بضع ثوانٍ. إذا لم يعمل، فانتظر ظهور رمز جديد في التطبيق."]],
    ["Activar notificaciones",["Enable notifications","Ativar notificações","Activer les notifications","Benachrichtigungen aktivieren","Attiva notifiche","Включить уведомления","启用通知","通知を有効にする","تفعيل الإشعارات"]],
    ["Todo al día",["All caught up","Tudo em dia","Tout est à jour","Alles auf dem neuesten Stand","Tutto aggiornato","Всё актуально","一切正常","すべて最新です","كل شيء محدث"]],
    ["Cuando tengas novedades, avisos o actualizaciones, aparecerán aquí organizados por día.",["When you have news, alerts or updates, they'll appear here, organized by day.","Quando houver novidades, avisos ou atualizações, eles aparecerão aqui organizados por dia.","Lorsque vous aurez des nouveautés, alertes ou mises à jour, elles apparaîtront ici, classées par jour.","Neuigkeiten, Hinweise oder Updates erscheinen hier nach Tagen sortiert.","Quando ci saranno novità, avvisi o aggiornamenti, appariranno qui organizzati per giorno.","Здесь будут появляться новости, уведомления и обновления, сгруппированные по дням.","有新消息、提醒或更新时，会按日期显示在这里。","新着情報、通知、更新があると、日付ごとにここに表示されます。","ستظهر هنا الأخبار والتنبيهات والتحديثات مرتبة حسب اليوم."]],
    ["Limpiar",["Clear","Limpar","Effacer","Leeren","Pulisci","Очистить","清除","クリア","مسح"]],
    ["Crear cuenta",["Create account","Criar conta","Créer un compte","Konto erstellen","Crea account","Создать аккаунт","创建账户","アカウントを作成","إنشاء حساب"]],
    ["Únete a nuestra comunidad gaming",["Join our gaming community","Junte-se à nossa comunidade gamer","Rejoignez notre communauté gaming","Werde Teil unserer Gaming-Community","Unisciti alla nostra community gaming","Присоединяйтесь к нашему игровому сообществу","加入我们的游戏社区","ゲームコミュニティに参加しましょう","انضم إلى مجتمع الألعاب لدينا"]],
    ["Términos y Condiciones",["Terms and Conditions","Termos e condições","Conditions générales","Allgemeine Geschäftsbedingungen","Termini e condizioni","Условия использования","条款和条件","利用規約","الشروط والأحكام"]],
    ["Política de Privacidad",["Privacy Policy","Política de privacidade","Politique de confidentialité","Datenschutzerklärung","Informativa sulla privacy","Политика конфиденциальности","隐私政策","プライバシーポリシー","سياسة الخصوصية"]],
    ["REGISTRARSE",["SIGN UP","CADASTRAR","S’INSCRIRE","REGISTRIEREN","REGISTRATI","ЗАРЕГИСТРИРОВАТЬСЯ","注册","登録","إنشاء حساب"]],
    ["¿Ya tienes una cuenta?",["Already have an account?","Já tem uma conta?","Vous avez déjà un compte ?","Hast du bereits ein Konto?","Hai già un account?","Уже есть аккаунт?","已经有账户？","すでにアカウントをお持ちですか？","هل لديك حساب بالفعل؟"]],
    ["Inicia sesión",["Log in","Entrar","Se connecter","Anmelden","Accedi","Войти","登录","ログイン","تسجيل الدخول"]],
    ["RESEÑAS",["REVIEWS","AVALIAÇÕES","AVIS","BEWERTUNGEN","RECENSIONI","ОТЗЫВЫ","评价","レビュー","التقييمات"]],
    ["Cargando reseñas…",["Loading reviews…","Carregando avaliações…","Chargement des avis…","Bewertungen werden geladen…","Caricamento recensioni…","Загрузка отзывов…","正在加载评价…","レビューを読み込み中…","جارٍ تحميل التقييمات…"]],
    ["Cargando opiniones de la comunidad…",["Loading community reviews…","Carregando opiniões da comunidade…","Chargement des avis de la communauté…","Community-Bewertungen werden geladen…","Caricamento delle opinioni della community…","Загрузка отзывов сообщества…","正在加载社区评价…","コミュニティのレビューを読み込み中…","جارٍ تحميل آراء المجتمع…"]],
    ["Crear reseña",["Write a review","Criar avaliação","Rédiger un avis","Bewertung schreiben","Scrivi una recensione","Оставить отзыв","撰写评价","レビューを書く","اكتب تقييمًا"]],
    ["Comparte tu experiencia",["Share your experience","Compartilhe sua experiência","Partagez votre expérience","Teile deine Erfahrung","Condividi la tua esperienza","Поделитесь впечатлениями","分享你的体验","体験を共有しましょう","شارك تجربتك"]],
    ["Tu opinión ayuda a otros usuarios de la comunidad.",["Your opinion helps other community members.","Sua opinião ajuda outros membros da comunidade.","Votre avis aide les autres membres de la communauté.","Deine Meinung hilft anderen Mitgliedern der Community.","La tua opinione aiuta gli altri membri della community.","Ваше мнение помогает другим участникам сообщества.","你的意见可以帮助社区中的其他用户。","あなたの意見はコミュニティの他のユーザーの役に立ちます。","رأيك يساعد المستخدمين الآخرين في المجتمع."]],
    ["Título de tu reseña",["Review title","Título da sua avaliação","Titre de votre avis","Titel deiner Bewertung","Titolo della recensione","Заголовок отзыва","评价标题","レビューのタイトル","عنوان تقييمك"]],
    ["Tu opinión",["Your review","Sua opinião","Votre avis","Deine Meinung","La tua opinione","Ваш отзыв","你的评价","あなたのレビュー","رأيك"]],
    ["Publicar reseña",["Submit review","Publicar avaliação","Publier l’avis","Bewertung veröffentlichen","Pubblica recensione","Опубликовать отзыв","发布评价","レビューを投稿","نشر التقييم"]],
    ["Acceso exclusivo",["Exclusive access","Acesso exclusivo","Accès exclusif","Exklusiver Zugang","Accesso esclusivo","Эксклюзивный доступ","专属访问","限定アクセス","وصول حصري"]],
    ["Esta sección está disponible únicamente para cuentas autorizadas.",["This section is only available to authorized accounts.","Esta seção está disponível apenas para contas autorizadas.","Cette section est réservée aux comptes autorisés.","Dieser Bereich ist nur für autorisierte Konten verfügbar.","Questa sezione è disponibile solo per gli account autorizzati.","Этот раздел доступен только авторизованным аккаунтам.","此部分仅对授权账户开放。","このセクションは許可されたアカウントのみ利用できます。","هذا القسم متاح للحسابات المصرح لها فقط."]],
    ["Volver a mi cuenta",["Back to my account","Voltar para minha conta","Retour à mon compte","Zurück zu meinem Konto","Torna al mio account","Вернуться в мой аккаунт","返回我的账户","アカウントに戻る","العودة إلى حسابي"]],
    ["Tu nivel actual",["Your current level","Seu nível atual","Votre niveau actuel","Dein aktuelles Level","Il tuo livello attuale","Ваш текущий уровень","当前等级","現在のレベル","مستواك الحالي"]],
    ["Planes y niveles",["Plans and levels","Planos e níveis","Offres et niveaux","Pläne und Stufen","Piani e livelli","Планы и уровни","计划与等级","プランとレベル","الخطط والمستويات"]],
    ["Hacer una recarga",["Make a top-up","Fazer uma recarga","Effectuer une recharge","Aufladen","Effettua una ricarica","Пополнить","进行充值","チャージする","إجراء عملية شحن"]],
    ["Tu negocio",["Your business","Seu negócio","Votre activité","Dein Geschäft","La tua attività","Ваш бизнес","你的业务","あなたのビジネス","عملك"]],
    ["Mis ventas",["My sales","Minhas vendas","Mes ventes","Meine Verkäufe","Le mie vendite","Мои продажи","我的销售","売上","مبيعاتي"]],
    ["Actividad e historial",["Activity and history","Atividade e histórico","Activité et historique","Aktivität und Verlauf","Attività e cronologia","Активность и история","活动与历史记录","アクティビティと履歴","النشاط والسجل"]],
    ["Lista de precios",["Price list","Lista de preços","Liste de prix","Preisliste","Listino prezzi","Прайс-лист","价格表","価格表","قائمة الأسعار"]],
    ["Ganancia y compartir",["Earnings and sharing","Ganhos e compartilhamento","Gains et partage","Verdienst und Teilen","Guadagni e condivisione","Доход и публикация","收益与分享","収益と共有","الأرباح والمشاركة"]],
    ["Clientes frecuentes",["Frequent customers","Clientes frequentes","Clients réguliers","Stammkunden","Clienti abituali","Постоянные клиенты","常客","常連客","العملاء الدائمون"]],
    ["Top 10 por recargas",["Top 10 by top-ups","Top 10 por recargas","Top 10 des recharges","Top 10 nach Aufladungen","Top 10 per ricariche","Топ-10 по пополнениям","充值次数前十名","チャージ数トップ10","أفضل 10 حسب عمليات الشحن"]],
    ["Logo y comprobantes",["Logo and receipts","Logo e comprovantes","Logo et reçus","Logo und Belege","Logo e ricevute","Логотип и квитанции","标志和凭证","ロゴと領収書","الشعار والإيصالات"]],
    ["Equipo de trabajo",["Team","Equipe de trabalho","Équipe","Team","Team di lavoro","Рабочая команда","团队","チーム","فريق العمل"]],
    ["Miembros y permisos",["Members and permissions","Membros e permissões","Membres et autorisations","Mitglieder und Berechtigungen","Membri e autorizzazioni","Участники и разрешения","成员与权限","メンバーと権限","الأعضاء والأذونات"]],
    ["Cargando clientes...",["Loading customers...","Carregando clientes...","Chargement des clients...","Kunden werden geladen...","Caricamento clienti...","Загрузка клиентов...","正在加载客户...","顧客を読み込み中...","جارٍ تحميل العملاء..."]],
    ["El porcentaje se suma al precio que pagas después de tu descuento por nivel.",["The percentage is added to the price you pay after your level discount.","A porcentagem é adicionada ao preço que você paga após o desconto do seu nível.","Le pourcentage est ajouté au prix que vous payez après votre remise de niveau.","Der Prozentsatz wird zum Preis nach deinem Level-Rabatt hinzugefügt.","La percentuale si aggiunge al prezzo che paghi dopo lo sconto del tuo livello.","Процент добавляется к цене после скидки за уровень.","该百分比会加到等级折扣后的价格上。","割合はレベル割引後の価格に加算されます。","تُضاف النسبة إلى السعر الذي تدفعه بعد خصم مستواك."]],
    ["Todos los juegos",["All games","Todos os jogos","Tous les jeux","Alle Spiele","Tutti i giochi","Все игры","所有游戏","すべてのゲーム","كل الألعاب"]],
    ["Copiar precios visibles",["Copy visible prices","Copiar preços visíveis","Copier les prix visibles","Sichtbare Preise kopieren","Copia i prezzi visibili","Скопировать видимые цены","复制可见价格","表示中の価格をコピー","نسخ الأسعار الظاهرة"]],
    ["Acceso API",["API access","Acesso à API","Accès API","API-Zugang","Accesso API","Доступ к API","API 接入","APIアクセス","الوصول إلى API"]],
    ["Conecta tu tienda con la API de Gamers Gold cuando esté disponible.",["Connect your store to the Gamers Gold API when it's available.","Conecte sua loja à API da Gamers Gold quando estiver disponível.","Connectez votre boutique à l’API Gamers Gold lorsqu’elle sera disponible.","Verbinde deinen Shop mit der Gamers-Gold-API, sobald sie verfügbar ist.","Collega il tuo negozio all’API Gamers Gold quando sarà disponibile.","Подключите магазин к API Gamers Gold, когда она станет доступна.","API 上线后，将你的商店连接到 Gamers Gold。","利用可能になったら、ストアをGamers Gold APIに接続できます。","اربط متجرك بواجهة Gamers Gold API عند توفرها."]],
    ["Ver documentación",["View documentation","Ver documentação","Voir la documentation","Dokumentation ansehen","Visualizza la documentazione","Посмотреть документацию","查看文档","ドキュメントを見る","عرض الوثائق"]],
    ["Gestionar API",["Manage API","Gerenciar API","Gérer l’API","API verwalten","Gestisci API","Управление API","管理 API","APIを管理","إدارة API"]],
    ["NUEVA SOLICITUD",["NEW REQUEST","NOVA SOLICITAÇÃO","NOUVELLE DEMANDE","NEUE ANFRAGE","NUOVA RICHIESTA","НОВОЕ ОБРАЩЕНИЕ","新请求","新しいリクエスト","طلب جديد"]],
    ["Cuéntanos qué sucede",["Tell us what happened","Conte-nos o que aconteceu","Expliquez-nous ce qui se passe","Erzähl uns, was passiert ist","Raccontaci cosa è successo","Расскажите, что произошло","告诉我们发生了什么","状況をお聞かせください","أخبرنا بما حدث"]],
    ["Categoría",["Category","Categoria","Catégorie","Kategorie","Categoria","Категория","类别","カテゴリー","الفئة"]],
    ["Pagos",["Payments","Pagamentos","Paiements","Zahlungen","Pagamenti","Платежи","付款","支払い","المدفوعات"]],
    ["Compras",["Purchases","Compras","Achats","Käufe","Acquisti","Покупки","购买","購入","المشتريات"]],
    ["Recargas",["Top-ups","Recargas","Recharges","Aufladungen","Ricariche","Пополнения","充值","チャージ","عمليات الشحن"]],
    ["Problemas técnicos",["Technical issues","Problemas técnicos","Problèmes techniques","Technische Probleme","Problemi tecnici","Технические проблемы","技术问题","技術的な問題","مشكلات تقنية"]],
    ["Otro",["Other","Outro","Autre","Andere","Altro","Другое","其他","その他","أخرى"]],
    ["Mensaje",["Message","Mensagem","Message","Nachricht","Messaggio","Сообщение","消息","メッセージ","الرسالة"]],
    ["Enviar ticket",["Submit ticket","Enviar chamado","Envoyer le ticket","Ticket senden","Invia ticket","Отправить обращение","提交工单","チケットを送信","إرسال التذكرة"]],
    ["Tus solicitudes de soporte",["Your support requests","Suas solicitações de suporte","Vos demandes d’assistance","Deine Supportanfragen","Le tue richieste di assistenza","Ваши обращения в поддержку","你的支持请求","サポートへのお問い合わせ","طلبات الدعم الخاصة بك"]],
    ["Gestión de tickets",["Ticket management","Gerenciamento de chamados","Gestion des tickets","Ticketverwaltung","Gestione ticket","Управление обращениями","工单管理","チケット管理","إدارة التذاكر"]],
    ["Atención al cliente.",["Customer service.","Atendimento ao cliente.","Service client.","Kundenservice.","Servizio clienti.","Служба поддержки.","客户服务。","カスタマーサービス。","خدمة العملاء."]],
    ["Gestiona las solicitudes",["Manage requests","Gerencie as solicitações","Gérez les demandes","Verwalte Anfragen","Gestisci le richieste","Управляйте обращениями","管理请求","リクエストを管理","إدارة الطلبات"]],
    ["de los usuarios.",["from users.","dos usuários.","des utilisateurs.","von Benutzern.","degli utenti.","пользователей.","用户的。","ユーザーからの。","من المستخدمين."]],
    ["Inicia sesión para crear y consultar tus tickets.",["Log in to create and view your tickets.","Faça login para criar e consultar seus chamados.","Connectez-vous pour créer et consulter vos tickets.","Melde dich an, um Tickets zu erstellen und anzusehen.","Accedi per creare e consultare i tuoi ticket.","Войдите, чтобы создавать обращения и просматривать их.","登录以创建和查看工单。","ログインしてチケットを作成・確認してください。","سجّل الدخول لإنشاء تذاكرك ومراجعتها."]],
    ["Para utilizar el centro de soporte necesitas iniciar sesión con tu cuenta.",["To use the support center, you need to log in to your account.","Para usar a central de suporte, você precisa entrar na sua conta.","Pour utiliser le centre d’assistance, vous devez vous connecter à votre compte.","Um das Support-Center zu nutzen, musst du dich in deinem Konto anmelden.","Per utilizzare il centro assistenza, devi accedere al tuo account.","Чтобы пользоваться центром поддержки, войдите в свой аккаунт.","使用帮助中心需要先登录账户。","サポートセンターを利用するには、アカウントにログインしてください。","لاستخدام مركز الدعم، يجب تسجيل الدخول إلى حسابك."]],
    ["Iniciar sesión",["Log in","Entrar","Se connecter","Anmelden","Accedi","Войти","登录","ログイン","تسجيل الدخول"]],
    ["Asunto",["Subject","Assunto","Objet","Betreff","Oggetto","Тема","主题","件名","الموضوع"]],
    ["Tu satisfacción",["Your satisfaction","Sua satisfação","Votre satisfaction","Deine Zufriedenheit","La tua soddisfazione","Ваше удовлетворение","您的满意","お客様の満足","رضاك"]],
    ["es nuestra prioridad",["is our priority","é nossa prioridade","est notre priorité","hat für uns Priorität","è la nostra priorità","— наш приоритет","是我们的首要任务","が私たちの最優先事項です","هو أولويتنا"]],
    ["Inicia sesión, pulsa “Nuevo ticket” y describe tu consulta. Nuestro equipo te responderá dentro de la misma conversación.",["Log in, click “New ticket” and describe your question. Our team will reply in the same conversation.","Entre, clique em “Novo chamado” e descreva sua dúvida. Nossa equipe responderá na mesma conversa.","Connectez-vous, cliquez sur « Nouveau ticket » et décrivez votre demande. Notre équipe répondra dans la même conversation.","Melde dich an, klicke auf „Neues Ticket“ und beschreibe dein Anliegen. Unser Team antwortet im selben Gespräch.","Accedi, clicca su «Nuovo ticket» e descrivi la tua richiesta. Il nostro team risponderà nella stessa conversazione.","Войдите, нажмите «Новое обращение» и опишите вопрос. Наша команда ответит в том же диалоге.","登录后点击“新建工单”并描述问题。我们的团队会在同一对话中回复。","ログインして「新しいチケット」を押し、お問い合わせ内容を記入してください。同じ会話内で担当者が返信します。","سجّل الدخول واضغط على «تذكرة جديدة» واشرح استفسارك. سيرد فريقنا ضمن المحادثة نفسها."]],
    ["Describe el problema e incluye, si corresponde, el producto o número de pedido. Nunca compartas contraseñas ni códigos de acceso.",["Describe the issue and include the product or order number if relevant. Never share passwords or access codes.","Descreva o problema e inclua, se necessário, o produto ou número do pedido. Nunca compartilhe senhas ou códigos de acesso.","Décrivez le problème et indiquez, si nécessaire, le produit ou le numéro de commande. Ne partagez jamais vos mots de passe ni codes d’accès.","Beschreibe das Problem und gib gegebenenfalls das Produkt oder die Bestellnummer an. Teile niemals Passwörter oder Zugangscodes.","Descrivi il problema e includi, se necessario, il prodotto o il numero d’ordine. Non condividere mai password o codici di accesso.","Опишите проблему и при необходимости укажите товар или номер заказа. Никогда не сообщайте пароли и коды доступа.","描述问题，并在必要时提供商品或订单编号。切勿分享密码或访问验证码。","問題を説明し、必要に応じて商品名や注文番号を記載してください。パスワードやアクセスコードは絶対に共有しないでください。","اشرح المشكلة وأضف المنتج أو رقم الطلب عند الحاجة. لا تشارك كلمات المرور أو رموز الدخول مطلقًا."]],
    ["Entra en la sección Cuenta y abre “Mis Compras” para consultar esa opción dentro de tu perfil.",["Go to the Account section and open “My Purchases” to view it in your profile.","Acesse a seção Conta e abra “Minhas compras” para consultar essa opção no seu perfil.","Accédez à section Compte et ouvrez « Mes achats » pour consulter cette option dans votre profil.","Gehe zum Bereich Konto und öffne „Meine Käufe“, um diese Option in deinem Profil aufzurufen.","Vai alla sezione Account e apri «I miei acquisti» per consultare questa opzione nel tuo profilo.","Перейдите в раздел «Аккаунт» и откройте «Мои покупки» в профиле.","进入账户部分并打开“我的订单”，即可在个人资料中查看。","アカウントから「購入履歴」を開くと、プロフィール内で確認できます。","انتقل إلى قسم الحساب وافتح «مشترياتي» للاطلاع عليها في ملفك الشخصي."]],
    ["Abre tu",["Open your","Abra seu","Ouvrez votre","Öffne deine","Apri la tua","Откройте","打开你的","次を開いてください：","افتح"]],
    ["App de códigos",["Authenticator app","Aplicativo de códigos","Application d’authentification","Authenticator-App","App di autenticazione","Приложение-аутентификатор","身份验证器应用","認証アプリ","تطبيق المصادقة"]],
    ["(por ejemplo, Google Authenticator) e introduce el código temporal de 6 dígitos para continuar.",["(for example, Google Authenticator) and enter the temporary 6-digit code to continue.","(por exemplo, Google Authenticator) e informe o código temporário de 6 dígitos para continuar.","(par exemple, Google Authenticator) et saisissez le code temporaire à 6 chiffres pour continuer.","(zum Beispiel Google Authenticator) und gib den temporären 6-stelligen Code ein, um fortzufahren.","(ad esempio Google Authenticator) e inserisci il codice temporaneo di 6 cifre per continuare.","(например, Google Authenticator) и введите временный 6-значный код, чтобы продолжить.","（例如 Google Authenticator），然后输入 6 位临时验证码以继续。","（Google Authenticatorなど）を開き、続行するために6桁の一時コードを入力してください。","(مثل Google Authenticator) وأدخل الرمز المؤقت المكوّن من 6 أرقام للمتابعة."]],
    ["Cambiar contraseña",["Change password","Alterar senha","Changer le mot de passe","Passwort ändern","Cambia password","Изменить пароль","更改密码","パスワードを変更","تغيير كلمة المرور"]],
    ["Actualiza la contraseña de tu cuenta",["Update your account password","Atualize a senha da sua conta","Mettez à jour le mot de passe de votre compte","Aktualisiere dein Kontopasswort","Aggiorna la password del tuo account","Обновите пароль аккаунта","更新账户密码","アカウントのパスワードを更新","حدّث كلمة مرور حسابك"]],
    ["Usa al menos 8 caracteres. La nueva contraseña debe ser diferente de la actual.",["Use at least 8 characters. Your new password must be different from the current one.","Use pelo menos 8 caracteres. A nova senha deve ser diferente da atual.","Utilisez au moins 8 caractères. Le nouveau mot de passe doit être différent de l’actuel.","Verwende mindestens 8 Zeichen. Das neue Passwort muss sich vom aktuellen unterscheiden.","Usa almeno 8 caratteri. La nuova password deve essere diversa da quella attuale.","Используйте не менее 8 символов. Новый пароль должен отличаться от текущего.","至少使用 8 个字符。新密码必须与当前密码不同。","8文字以上を使用してください。新しいパスワードは現在のものと異なる必要があります。","استخدم 8 أحرف على الأقل. يجب أن تختلف كلمة المرور الجديدة عن الحالية."]],
    ["ACTUALIZAR CONTRASEÑA",["UPDATE PASSWORD","ATUALIZAR SENHA","METTRE À JOUR LE MOT DE PASSE","PASSWORT AKTUALISIEREN","AGGIORNA PASSWORD","ОБНОВИТЬ ПАРОЛЬ","更新密码","パスワードを更新","تحديث كلمة المرور"]],
    ["Verificación en dos pasos",["Two-step verification","Verificação em duas etapas","Vérification en deux étapes","Zwei-Faktor-Authentifizierung","Verifica in due passaggi","Двухэтапная проверка","两步验证","2段階認証","التحقق بخطوتين"]],
    ["Protege tu cuenta con una app de códigos",["Protect your account with an authenticator app","Proteja sua conta com um aplicativo de códigos","Protégez votre compte avec une application d’authentification","Schütze dein Konto mit einer Authenticator-App","Proteggi il tuo account con un'app di autenticazione","Защитите аккаунт с помощью приложения-аутентификатора","使用身份验证器应用保护账户","認証アプリでアカウントを保護","احمِ حسابك باستخدام تطبيق مصادقة"]],
    ["Comprobando estado...",["Checking status...","Verificando status...","Vérification de l’état...","Status wird überprüft...","Verifica dello stato...","Проверка состояния...","正在检查状态...","状態を確認中...","جارٍ التحقق من الحالة..."]],
    ["Cerrar sesión en todos los dispositivos",["Sign out of all devices","Sair de todos os dispositivos","Déconnecter tous les appareils","Auf allen Geräten abmelden","Esci da tutti i dispositivi","Выйти на всех устройствах","退出所有设备","すべてのデバイスからログアウト","تسجيل الخروج من جميع الأجهزة"]],
    ["Finaliza las sesiones abiertas de tu cuenta",["End your account's active sessions","Encerre as sessões abertas da sua conta","Terminez les sessions ouvertes de votre compte","Beende die aktiven Sitzungen deines Kontos","Termina le sessioni aperte del tuo account","Завершите активные сеансы аккаунта","结束账户的所有已登录会话","アカウントで開いているセッションを終了","إنهاء الجلسات المفتوحة لحسابك"]],
    ["Información y detalles de INTERNACIONAL WEB",["Information and details about INTERNACIONAL WEB","Informações e detalhes da INTERNACIONAL WEB","Informations et détails sur INTERNACIONAL WEB","Informationen und Details zu INTERNACIONAL WEB","Informazioni e dettagli su INTERNACIONAL WEB","Информация и сведения о INTERNACIONAL WEB","关于 INTERNACIONAL WEB 的信息和详情","INTERNACIONAL WEBの情報と詳細","معلومات وتفاصيل حول INTERNACIONAL WEB"]],
    ["Selecciona una tarjeta",["Select a card","Selecione um cartão","Sélectionnez une carte","Karte auswählen","Seleziona una carta","Выберите карту","选择一张卡","カードを選択","اختر بطاقة"]],
    ["No se pudieron cargar las regiones",["Regions couldn't be loaded","Não foi possível carregar as regiões","Impossible de charger les régions","Regionen konnten nicht geladen werden","Impossibile caricare le regioni","Не удалось загрузить регионы","无法加载地区","地域を読み込めませんでした","تعذر تحميل المناطق"]],
    ["Procesando",["Processing","Processando","En cours de traitement","Wird bearbeitet","In elaborazione","Обработка","处理中","処理中","قيد المعالجة"]],
    ["Pedido completado",["Order completed","Pedido concluído","Commande terminée","Bestellung abgeschlossen","Ordine completato","Заказ выполнен","订单已完成","注文完了","اكتمل الطلب"]],
    ["Volver",["Back","Voltar","Retour","Zurück","Indietro","Назад","返回","戻る","رجوع"]],
    ["Pedido recibido",["Order received","Pedido recebido","Commande reçue","Bestellung erhalten","Ordine ricevuto","Заказ получен","订单已收到","注文を受け付けました","تم استلام الطلب"]],
    ["RECARGA,",["TOP UP,","RECARREGUE,","RECHARGEZ,","LADEN,","RICARICA,","ПОПОЛНЯЙ,","充值，","チャージ、","اشحن،"]],
    ["JUEGA",["PLAY","JOGUE","JOUEZ","SPIELE","GIOCA","ИГРАЙ","畅玩","プレイ","العب"]],
    ["SIN LÍMITES.",["WITHOUT LIMITS.","SEM LIMITES.","SANS LIMITES.","OHNE GRENZEN.","SENZA LIMITI.","БЕЗ ОГРАНИЧЕНИЙ.","无限制。","無制限。","بلا حدود."]],
    ["UN MUNDO DE",["A WORLD OF","UM MUNDO DE","UN MONDE DE","EINE WELT VOLL","UN MONDO DI","МИР","一个充满","無限の","عالم من"]],
    ["POSIBILIDADES.",["POSSIBILITIES.","POSSIBILIDADES.","POSSIBILITÉS.","MÖGLICHKEITEN.","POSSIBILITÀ.","ВОЗМОЖНОСТЕЙ.","可能性。","可能性。","الإمكانيات."]],
    ["MENOS VUELTAS.",["LESS HASSLE.","MENOS COMPLICAÇÃO.","MOINS DE DÉTOURS.","WENIGER UMWEGE.","MENO COMPLICAZIONI.","МЕНЬШЕ ХЛОПОТ.","更省事。","手間を減らす。","بخطوات أقل."]],
    ["MÁS JUEGO.",["MORE PLAY.","MAIS JOGO.","PLUS DE JEU.","MEHR SPIEL.","PIÙ GIOCO.","БОЛЬШЕ ИГРЫ.","更多游戏。","もっとプレイ。","مزيد من اللعب."]],
    ["HECHO PARA GAMERS",["MADE FOR GAMERS","FEITO PARA GAMERS","FAIT POUR LES GAMERS","FÜR GAMER GEMACHT","FATTO PER I GAMER","СОЗДАНО ДЛЯ ГЕЙМЕРОВ","为玩家打造","ゲーマーのために","مصمم للاعبين"]],
    ["UN MUNDO DE BENEFICIOS",["A WORLD OF BENEFITS","UM MUNDO DE BENEFÍCIOS","UN MONDE D’AVANTAGES","EINE WELT VOLLER VORTEILE","UN MONDO DI VANTAGGI","МИР ПРЕИМУЩЕСТВ","福利世界","特典の世界","عالم من المزايا"]],
    ["¿TIENES UNA",["DO YOU HAVE A","VOCÊ TEM UMA","AVEZ-VOUS UNE","HAST DU EINE","HAI UNA","У ТЕБЯ ЕСТЬ","你是否拥有","あなたには","هل لديك"]],
    ["COMUNIDAD?",["COMMUNITY?","COMUNIDADE?","COMMUNAUTÉ ?","COMMUNITY?","COMMUNITY?","СООБЩЕСТВО?","社区？","コミュニティ？","مجتمع؟"]],
    ["QUIERO SABER MÁS ↗",["LEARN MORE ↗","QUERO SABER MAIS ↗","EN SAVOIR PLUS ↗","MEHR ERFAHREN ↗","SCOPRI DI PIÙ ↗","УЗНАТЬ БОЛЬШЕ ↗","了解更多 ↗","詳しく見る ↗","أريد معرفة المزيد ↗"]],
    ["Recibirías (estimación)",["You would receive (estimate)","Você receberia (estimativa)","Vous recevriez (estimation)","Du erhältst (Schätzung)","Riceveresti (stima)","Вы получите (примерно)","预计到账","受取予定額（概算）","ستتلقى (تقديريًا)"]],
    ["Equivalencia estimada",["Estimated equivalent","Equivalência estimada","Équivalent estimé","Geschätzter Gegenwert","Equivalenza stimata","Расчётный эквивалент","预计等值","推定相当額","القيمة المكافئة المقدرة"]],
    ["Dirección de pago",["Payment address","Endereço de pagamento","Adresse de paiement","Zahlungsadresse","Indirizzo di pagamento","Адрес для оплаты","付款地址","支払いアドレス","عنوان الدفع"]],
    ["Enviar exactamente por la RED BEP20 (BNB SMART CHAIN)",["Send the exact amount via the BEP20 NETWORK (BNB SMART CHAIN)","Envie exatamente pela REDE BEP20 (BNB SMART CHAIN)","Envoyez exactement via le RÉSEAU BEP20 (BNB SMART CHAIN)","Sende den genauen Betrag über das BEP20-NETZWERK (BNB SMART CHAIN)","Invia esattamente tramite la RETE BEP20 (BNB SMART CHAIN)","Отправьте точную сумму через сеть BEP20 (BNB SMART CHAIN)","请通过 BEP20 网络（BNB SMART CHAIN）准确转账","BEP20ネットワーク（BNB SMART CHAIN）で正確な金額を送金してください","أرسل المبلغ المحدد عبر شبكة BEP20 (BNB SMART CHAIN)"]],
    ["Pedido creado. Envía exactamente",["Order created. Send exactly","Pedido criado. Envie exatamente","Commande créée. Envoyez exactement","Bestellung erstellt. Sende genau","Ordine creato. Invia esattamente","Заказ создан. Отправьте точно","订单已创建。请准确发送","注文が作成されました。正確に送金してください","تم إنشاء الطلب. أرسل بالضبط"]],
    ["a la dirección indicada.",["to the address shown.","para o endereço indicado.","à l’adresse indiquée.","an die angegebene Adresse.","all’indirizzo indicato.","на указанный адрес.","至指定地址。","表示されたアドレスへ。","إلى العنوان الموضح."]],
    ["Red: BNB Smart Chain · BEP20",["Network: BNB Smart Chain · BEP20","Rede: BNB Smart Chain · BEP20","Réseau : BNB Smart Chain · BEP20","Netzwerk: BNB Smart Chain · BEP20","Rete: BNB Smart Chain · BEP20","Сеть: BNB Smart Chain · BEP20","网络：BNB Smart Chain · BEP20","ネットワーク：BNB Smart Chain · BEP20","الشبكة: BNB Smart Chain · BEP20"]],
    ["Ingresa el Hash de la transacción (TXID)",["Enter the transaction hash (TXID)","Insira o hash da transação (TXID)","Saisissez le hash de la transaction (TXID)","Gib den Transaktions-Hash (TXID) ein","Inserisci l'hash della transazione (TXID)","Введите хеш транзакции (TXID)","输入交易哈希（TXID）","取引ハッシュ（TXID）を入力","أدخل تجزئة المعاملة (TXID)"]],
    ["Pagar",["Pay","Pagar","Payer","Bezahlen","Paga","Оплатить","支付","支払う","ادفع"]],
    ["Selecciona el paquete",["Select a package","Selecione o pacote","Sélectionnez un forfait","Paket auswählen","Seleziona il pacchetto","Выберите пакет","选择套餐","パッケージを選択","اختر الباقة"]],
    ["Número de teléfono",["Phone number","Número de telefone","Numéro de téléphone","Telefonnummer","Numero di telefono","Номер телефона","电话号码","電話番号","رقم الهاتف"]],
    ["Correo electrónico",["Email address","Endereço de e-mail","Adresse e-mail","E-Mail-Adresse","Indirizzo e-mail","Адрес электронной почты","电子邮箱","メールアドレス","البريد الإلكتروني"]],
    ["GUARDAR CAMBIOS",["SAVE CHANGES","SALVAR ALTERAÇÕES","ENREGISTRER LES MODIFICATIONS","ÄNDERUNGEN SPEICHERN","SALVA MODIFICHE","СОХРАНИТЬ ИЗМЕНЕНИЯ","保存更改","変更を保存","حفظ التغييرات"]],
    ["Acceso con tu cuenta de Google",["Sign in with your Google account","Acesso com sua conta do Google","Connexion avec votre compte Google","Mit deinem Google-Konto anmelden","Accedi con il tuo account Google","Вход через аккаунт Google","使用 Google 账户登录","Googleアカウントでログイン","الدخول باستخدام حساب Google"]],
    ["Acceso con tu dirección de correo",["Sign in with your email address","Acesso com seu endereço de e-mail","Connexion avec votre adresse e-mail","Mit deiner E-Mail-Adresse anmelden","Accedi con il tuo indirizzo e-mail","Вход по адресу электронной почты","使用电子邮箱登录","メールアドレスでログイン","الدخول باستخدام بريدك الإلكتروني"]],
    ["Acceso mediante tu cuenta de Telegram",["Sign in with your Telegram account","Acesso pela sua conta do Telegram","Connexion avec votre compte Telegram","Mit deinem Telegram-Konto anmelden","Accedi con il tuo account Telegram","Вход через аккаунт Telegram","使用 Telegram 账户登录","Telegramアカウントでログイン","الدخول باستخدام حساب Telegram"]],
    ["Cantidad Personalizada",["Custom amount","Valor personalizado","Montant personnalisé","Benutzerdefinierter Betrag","Importo personalizzato","Своя сумма","自定义金额","カスタム金額","مبلغ مخصص"]],
    ["Juegos",["Games","Jogos","Jeux","Spiele","Giochi","Игры","游戏","ゲーム","الألعاب"]],
    ["Depósitos",["Deposits","Depósitos","Dépôts","Einzahlungen","Depositi","Депозиты","充值","入金","الإيداعات"]],
    ["Entregadas",["Delivered","Entregues","Livrées","Zugestellt","Consegnate","Доставлено","已交付","配達済み","تم التسليم"]],
    ["En curso",["In progress","Em andamento","En cours","In Bearbeitung","In corso","В процессе","进行中","進行中","قيد التنفيذ"]],
    ["Este mes",["This month","Este mês","Ce mois-ci","Diesen Monat","Questo mese","В этом месяце","本月","今月","هذا الشهر"]],
    ["Completados",["Completed","Concluídos","Terminés","Abgeschlossen","Completati","Завершено","已完成","完了","مكتملة"]],
    ["Pendientes",["Pending","Pendentes","En attente","Ausstehend","In sospeso","Ожидают","待处理","保留中","قيد الانتظار"]],
    ["Revisión",["Review","Revisão","Vérification","Prüfung","Revisione","Проверка","审核","確認","مراجعة"]],
    ["DESCUBRE Y CONSIGUE",["DISCOVER AND EARN","DESCUBRA E GANHE","DÉCOUVREZ ET GAGNEZ","ENTDECKEN UND VERDIENEN","SCOPRI E OTTIENI","УЗНАВАЙ И ПОЛУЧАЙ","发现并获取","見つけて獲得","اكتشف واكسب"]],
    ["Invita amigos y gana el 5% de su primera compra completada.",["Invite friends and earn 5% of their first completed purchase.","Convide amigos e ganhe 5% da primeira compra concluída deles.","Invitez des amis et gagnez 5 % sur leur premier achat terminé.","Lade Freunde ein und erhalte 5 % ihres ersten abgeschlossenen Kaufs.","Invita amici e guadagna il 5% sul loro primo acquisto completato.","Приглашайте друзей и получайте 5% от их первой завершённой покупки.","邀请好友，赚取他们首次完成购买金额的 5%。","友達を招待して、初回購入完了額の5%を獲得しましょう。","ادعُ أصدقاءك واكسب 5٪ من أول عملية شراء مكتملة لهم."]],
    ["Avisos en tu teléfono",["Alerts on your phone","Avisos no seu telefone","Alertes sur votre téléphone","Benachrichtigungen auf deinem Telefon","Avvisi sul telefono","Уведомления на телефоне","手机提醒","スマートフォンへの通知","تنبيهات على هاتفك"]],
    ["Confirmación, progreso y resultado de tus compras.",["Confirmation, progress and results of your purchases.","Confirmação, progresso e resultado das suas compras.","Confirmation, progression et résultat de vos achats.","Bestätigung, Fortschritt und Ergebnis deiner Käufe.","Conferma, avanzamento e risultato dei tuoi acquisti.","Подтверждение, ход и результат ваших покупок.","订单确认、进度和结果。","購入の確認、進行状況、結果。","تأكيد مشترياتك وتقدمها ونتائجها."]],
    ["Depósitos recibidos, confirmados o rechazados.",["Deposits received, confirmed or rejected.","Depósitos recebidos, confirmados ou rejeitados.","Dépôts reçus, confirmés ou refusés.","Erhaltene, bestätigte oder abgelehnte Einzahlungen.","Depositi ricevuti, confermati o rifiutati.","Полученные, подтверждённые или отклонённые депозиты.","已收到、确认或拒绝的充值。","入金の受領、確認、拒否。","الإيداعات المستلمة أو المؤكدة أو المرفوضة."]],
    ["Cambios de contraseña y avisos de protección.",["Password changes and security alerts.","Alterações de senha e avisos de proteção.","Modifications du mot de passe et alertes de protection.","Passwortänderungen und Sicherheitshinweise.","Modifiche della password e avvisi di sicurezza.","Изменения пароля и уведомления о защите.","密码更改和安全提醒。","パスワード変更と保護に関する通知。","تغييرات كلمة المرور وتنبيهات الحماية."]],
    ["Información general, novedades y anuncios de la plataforma.",["General information, news and platform announcements.","Informações gerais, novidades e anúncios da plataforma.","Informations générales, actualités et annonces de la plateforme.","Allgemeine Informationen, Neuigkeiten und Ankündigungen der Plattform.","Informazioni generali, novità e annunci della piattaforma.","Общая информация, новости и объявления платформы.","平台的一般信息、最新动态和公告。","プラットフォームの一般情報、最新情報、お知らせ。","المعلومات العامة والأخبار وإعلانات المنصة."]],
    ["Guardar preferencias",["Save preferences","Salvar preferências","Enregistrer les préférences","Einstellungen speichern","Salva preferenze","Сохранить настройки","保存偏好设置","設定を保存","حفظ التفضيلات"]],
    ["Qué bueno tenerte de vuelta",["Welcome back","Que bom ter você de volta","Heureux de vous revoir","Schön, dass du wieder da bist","Bentornato","Рады снова вас видеть","欢迎回来","お帰りなさい","سعداء بعودتك"]],
    ["Recordarme",["Remember me","Lembrar-me","Se souvenir de moi","Angemeldet bleiben","Ricordami","Запомнить меня","记住我","ログイン状態を保持","تذكرني"]],
    ["¿Olvidaste tu contraseña?",["Forgot your password?","Esqueceu sua senha?","Mot de passe oublié ?","Passwort vergessen?","Hai dimenticato la password?","Забыли пароль?","忘记密码？","パスワードをお忘れですか？","هل نسيت كلمة المرور؟"]],
    ["¿Todavía no tienes cuenta?",["Don't have an account yet?","Ainda não tem uma conta?","Vous n’avez pas encore de compte ?","Du hast noch kein Konto?","Non hai ancora un account?","Ещё нет аккаунта?","还没有账户？","まだアカウントをお持ちでないですか？","ليس لديك حساب بعد؟"]],
    ["Regístrate",["Sign up","Cadastre-se","S’inscrire","Registrieren","Registrati","Зарегистрироваться","注册","登録","سجّل"]],
    ["Correo de entrega",["Delivery email","E-mail de entrega","E-mail de livraison","E-Mail für Zustellung","E-mail di consegna","Почта для доставки","收件邮箱","お届け先メール","بريد التسليم"]],
    ["Importe",["Amount","Valor","Montant","Betrag","Importo","Сумма","金额","金額","المبلغ"]],
    ["Selecciona el importe",["Select the amount","Selecione o valor","Sélectionnez le montant","Betrag auswählen","Seleziona l'importo","Выберите сумму","选择金额","金額を選択","اختر المبلغ"]],
    ["Selecciona una región",["Select a region","Selecione uma região","Sélectionnez une région","Region auswählen","Seleziona una regione","Выберите регион","选择地区","地域を選択","اختر منطقة"]],
    ["Dispositivos",["Devices","Dispositivos","Appareils","Geräte","Dispositivi","Устройства","设备","デバイス","الأجهزة"]],
    ["Acerca de",["About","Sobre","À propos","Über uns","Informazioni","О проекте","关于","概要","حول"]],
    ["Cuenta y privacidad",["Account and privacy","Conta e privacidade","Compte et confidentialité","Konto und Datenschutz","Account e privacy","Аккаунт и конфиденциальность","账户与隐私","アカウントとプライバシー","الحساب والخصوصية"]],
    ["Información",["Information","Informações","Informations","Informationen","Informazioni","Информация","信息","情報","المعلومات"]],
    ["Preferencias",["Preferences","Preferências","Préférences","Einstellungen","Preferenze","Настройки","偏好设置","設定","التفضيلات"]],
    ["Nombre y apellidos",["First and last name","Nome e sobrenome","Nom et prénom","Vor- und Nachname","Nome e cognome","Имя и фамилия","姓名","氏名","الاسم الكامل"]],
    ["Usuario",["Username","Usuário","Nom d’utilisateur","Benutzername","Nome utente","Имя пользователя","用户名","ユーザー名","اسم المستخدم"]],
    ["Activo",["Active","Ativo","Actif","Aktiv","Attivo","Активен","正常","有効","نشط"]],
    ["↻ Actualizar",["↻ Refresh","↻ Atualizar","↻ Actualiser","↻ Aktualisieren","↻ Aggiorna","↻ Обновить","↻ 刷新","↻ 更新","↻ تحديث"]],
    ["Cargando panel administrativo...",["Loading admin panel...","Carregando painel administrativo...","Chargement du panneau d’administration...","Admin-Panel wird geladen...","Caricamento del pannello amministrativo...","Загрузка панели администратора...","正在加载管理面板...","管理パネルを読み込み中...","جارٍ تحميل لوحة الإدارة..."]],
    ["Ajustar saldo USDT",["Adjust USDT balance","Ajustar saldo USDT","Ajuster le solde USDT","USDT-Guthaben anpassen","Regola saldo USDT","Изменить баланс USDT","调整 USDT 余额","USDT残高を調整","تعديل رصيد USDT"]],
    ["Selecciona el importe que deseas sumar o restar. El movimiento quedará registrado en el historial.",["Select the amount you want to add or subtract. The transaction will be recorded in the history.","Selecione o valor que deseja adicionar ou subtrair. A movimentação ficará registrada no histórico.","Sélectionnez le montant à ajouter ou à soustraire. L’opération sera enregistrée dans l’historique.","Wähle den Betrag, den du hinzufügen oder abziehen möchtest. Die Buchung wird im Verlauf gespeichert.","Seleziona l'importo da aggiungere o sottrarre. Il movimento verrà registrato nella cronologia.","Выберите сумму для добавления или вычитания. Операция будет записана в истории.","选择要增加或扣除的金额。该操作将记录在历史记录中。","追加または差し引く金額を選択してください。操作は履歴に記録されます。","حدد المبلغ الذي تريد إضافته أو خصمه. سيتم تسجيل الحركة في السجل."]],
    ["Tipo de ajuste",["Adjustment type","Tipo de ajuste","Type d’ajustement","Anpassungsart","Tipo di modifica","Тип корректировки","调整类型","調整タイプ","نوع التعديل"]],
    ["＋ Aumentar saldo",["＋ Increase balance","＋ Aumentar saldo","＋ Augmenter le solde","＋ Guthaben erhöhen","＋ Aumenta saldo","＋ Увеличить баланс","＋ 增加余额","＋ 残高を増やす","＋ زيادة الرصيد"]],
    ["− Restar saldo",["− Decrease balance","− Diminuir saldo","− Diminuer le solde","− Guthaben verringern","− Riduci saldo","− Уменьшить баланс","− 扣除余额","− 残高を減らす","− خصم الرصيد"]],
    ["Importe en USDT",["Amount in USDT","Valor em USDT","Montant en USDT","Betrag in USDT","Importo in USDT","Сумма в USDT","USDT 金额","USDT金額","المبلغ بعملة USDT"]],
    ["Motivo obligatorio",["Reason required","Motivo obrigatório","Motif obligatoire","Begründung erforderlich","Motivo obbligatorio","Укажите причину","必须填写原因","理由が必要です","السبب مطلوب"]],
    ["Guardar ajuste",["Save adjustment","Salvar ajuste","Enregistrer l’ajustement","Anpassung speichern","Salva modifica","Сохранить корректировку","保存调整","調整を保存","حفظ التعديل"]],
    ["Todas las opciones",["All options","Todas as opções","Toutes les options","Alle Optionen","Tutte le opzioni","Все параметры","所有选项","すべてのオプション","كل الخيارات"]],
    ["Nivel inicial",["Starting level","Nível inicial","Niveau initial","Anfangsstufe","Livello iniziale","Начальный уровень","初始等级","初期レベル","المستوى الأولي"]],
    ["Tu marca",["Your brand","Sua marca","Votre marque","Deine Marke","Il tuo marchio","Ваш бренд","你的品牌","あなたのブランド","علامتك التجارية"]],
    ["Tu ganancia",["Your earnings","Seu ganho","Vos gains","Dein Verdienst","I tuoi guadagni","Ваш доход","你的收益","あなたの収益","أرباحك"]],
    ["Juego",["Game","Jogo","Jeu","Spiel","Gioco","Игра","游戏","ゲーム","اللعبة"]],
    ["Pronto",["Coming soon","Em breve","Bientôt","Demnächst","Prossimamente","Скоро","即将推出","近日公開","قريبًا"]],
    ["Panel de",["Reseller","Painel de","Panneau de","Panel für","Pannello","Панель","面板","パネル","لوحة"]],
    ["revendedor",["reseller","revendedor","revendeur","Wiederverkäufer","rivenditore","реселлер","分销商","リセラー","الموزع"]],
    ["Acceso",["Access","Acesso","Accès","Zugang","Accesso","Доступ","访问","アクセス","الوصول"]],
    ["exclusivo",["exclusive","exclusivo","exclusif","exklusiv","esclusivo","эксклюзивный","专属","限定","حصري"]],
    ["0 recargas completadas",["0 top-ups completed","0 recargas concluídas","0 recharges terminées","0 Aufladungen abgeschlossen","0 ricariche completate","0 пополнений выполнено","已完成 0 次充值","チャージ完了 0 件","0 عملية شحن مكتملة"]],
    ["25 recargas · 2%",["25 top-ups · 2%","25 recargas · 2%","25 recharges · 2%","25 Aufladungen · 2%","25 ricariche · 2%","25 пополнений · 2%","25 次充值 · 2%","チャージ25回 · 2%","25 عملية شحن · 2%"]],
    ["50 recargas · 3%",["50 top-ups · 3%","50 recargas · 3%","50 recharges · 3%","50 Aufladungen · 3%","50 ricariche · 3%","50 пополнений · 3%","50 次充值 · 3%","チャージ50回 · 3%","50 عملية شحن · 3%"]],
    ["90 recargas · 5%",["90 top-ups · 5%","90 recargas · 5%","90 recharges · 5%","90 Aufladungen · 5%","90 ricariche · 5%","90 пополнений · 5%","90 次充值 · 5%","チャージ90回 · 5%","90 عملية شحن · 5%"]],
    ["RECARGAS COMPLETADAS",["COMPLETED TOP-UPS","RECARGAS CONCLUÍDAS","RECHARGES TERMINÉES","ABGESCHLOSSENE AUFLADUNGEN","RICARICHE COMPLETATE","ВЫПОЛНЕННЫЕ ПОПОЛНЕНИЯ","已完成充值","完了したチャージ","عمليات الشحن المكتملة"]],
    ["TU DESCUENTO",["YOUR DISCOUNT","SEU DESCONTO","VOTRE REMISE","DEIN RABATT","IL TUO SCONTO","ВАША СКИДКА","你的折扣","あなたの割引","خصمك"]],
    ["TU NEGOCIO",["YOUR BUSINESS","SEU NEGÓCIO","VOTRE ACTIVITÉ","DEIN GESCHÄFT","LA TUA ATTIVITÀ","ВАШ БИЗНЕС","你的业务","あなたのビジネス","عملك"]],
    ["Mi cuenta",["My account","Minha conta","Mon compte","Mein Konto","Il mio account","Мой аккаунт","我的账户","マイアカウント","حسابي"]],
    ["ID:",["ID:","ID:","ID :","ID:","ID:","ID:","ID：","ID：","المعرّف:"]],
    ["Foto de perfil",["Profile photo","Foto de perfil","Photo de profil","Profilfoto","Foto del profilo","Фото профиля","头像","プロフィール写真","صورة الملف الشخصي"]],
    ["Añadir foto",["Add photo","Adicionar foto","Ajouter une photo","Foto hinzufügen","Aggiungi foto","Добавить фото","添加照片","写真を追加","إضافة صورة"]],
    ["Añadir foto de perfil",["Add profile photo","Adicionar foto de perfil","Ajouter une photo de profil","Profilfoto hinzufügen","Aggiungi foto del profilo","Добавить фото профиля","添加头像","プロフィール写真を追加","إضافة صورة الملف الشخصي"]],
    ["Copiar ID",["Copy ID","Copiar ID","Copier l’ID","ID kopieren","Copia ID","Скопировать ID","复制 ID","IDをコピー","نسخ المعرّف"]],
    ["Control Admin",["Admin Control","Controle Admin","Contrôle admin","Admin-Steuerung","Controllo Admin","Управление администратора","管理控制","管理者コントロール","تحكم المسؤول"]],
    ["Pendiente",["Pending","Pendente","En attente","Ausstehend","In sospeso","Ожидает","待处理","保留中","معلق"]]
  ];

  const DICTIONARIES = Object.fromEntries(LANGS.map(([code], index) => [
    code,
    Object.fromEntries(ROWS.map(([source, values]) => [source, index === 0 ? source : values[index - 1]]))
  ]));
  const isWordChar = char => !!char && /[\p{L}\p{N}]/u.test(char);
  const translate = (value, lang) => {
    if (!value || lang === "es") return value;
    const dictionary = DICTIONARIES[lang];
    if (!dictionary) return value;
    const clean = value.trim().replace(/\s+/g," ");
    if (dictionary[clean]) return dictionary[clean];
    let result = value;
    const keys = Object.keys(dictionary).filter(source => source.length >= 4).sort((a,b) => b.length - a.length);
    keys.forEach(source => {
      const target = dictionary[source];
      if (!target || source === target || !result.includes(source)) return;
      let from = 0;
      let at = result.indexOf(source,from);
      let output = "";
      let changed = false;
      while (at !== -1) {
        const before = at > 0 ? result[at - 1] : "";
        const after = result[at + source.length] || "";
        if (!isWordChar(before) && !isWordChar(after)) {
          output += result.slice(from,at) + target;
          from = at + source.length;
          changed = true;
        }
        at = result.indexOf(source,Math.max(at + source.length,from));
      }
      if (changed) result = output + result.slice(from);
    });
    return result;
  };
  const skip = "script,style,noscript,svg,code,pre,input,textarea,[contenteditable=true],[data-no-translate],.username,#account-user-code,.order-code,.player-id,.private-data";
  const skipAttributes = "script,style,noscript,svg,code,pre,[contenteditable=true],[data-no-translate],.username,#account-user-code,.order-code,.player-id,.private-data";
  const isEligible = node => !!(node && node.nodeValue && node.nodeValue.trim() && node.parentElement && !node.parentElement.closest(skip));
  const preserve = (value) => {
    const leading = value.match(/^\s*/)?.[0] || "";
    const trailing = value.match(/\s*$/)?.[0] || "";
    return {leading,trailing,body:value.trim()};
  };

  function translateNode(node, lang) {
    if (!isEligible(node)) return;
    if (lastTranslated.has(node) && node.nodeValue !== lastTranslated.get(node)) originals.set(node,node.nodeValue);
    if (!originals.has(node)) originals.set(node,node.nodeValue);
    const original = originals.get(node);
    const parts = preserve(original);
    const result = translate(parts.body,lang);
    const next = parts.leading + result + parts.trailing;
    if (node.nodeValue !== next) node.nodeValue = next;
    if (lang !== "es") lastTranslated.set(node,next);
    else lastTranslated.delete(node);
  }

  function translateElementAttributes(root,lang) {
    if (!root || lang === "es") return;
    const selector = "[placeholder],[aria-label],[title],input[type=button][value],input[type=submit][value],input[type=reset][value]";
    const elements = [];
    if (root.nodeType === Node.ELEMENT_NODE && root.matches(selector)) elements.push(root);
    if (root.querySelectorAll) elements.push(...root.querySelectorAll(selector));
    elements.forEach(el => {
      if (el.closest(skipAttributes)) return;
      const attrs = ["placeholder","aria-label","title"];
      if (el.matches("input[type=button][value],input[type=submit][value],input[type=reset][value]")) attrs.push("value");
      attrs.forEach(attr => {
        if (!el.hasAttribute(attr)) return;
        let originalsForElement = attributeOriginals.get(el);
        if (!originalsForElement) { originalsForElement = {}; attributeOriginals.set(el,originalsForElement); }
        let lastForElement = attributeLast.get(el);
        if (!lastForElement) { lastForElement = {}; attributeLast.set(el,lastForElement); }
        const actual = el.getAttribute(attr);
        if (lastForElement[attr] && actual !== lastForElement[attr]) originalsForElement[attr] = actual;
        if (!(attr in originalsForElement)) originalsForElement[attr] = actual;
        const next = translate(originalsForElement[attr],lang);
        if (actual !== next) el.setAttribute(attr,next);
        lastForElement[attr] = next;
      });
    });
  }

  function restoreAll() {
    if (observer) observer.disconnect();
    const walker = document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (originals.has(node)) {
        node.nodeValue = originals.get(node);
        lastTranslated.delete(node);
      }
    }
    document.querySelectorAll("[placeholder],[aria-label],[title],input[type=button][value],input[type=submit][value],input[type=reset][value]").forEach(el => {
      const saved = attributeOriginals.get(el);
      if (saved) Object.keys(saved).forEach(attr => el.setAttribute(attr,saved[attr]));
      const last = attributeLast.get(el);
      if (last) Object.keys(last).forEach(attr => delete last[attr]);
    });
    const titleNode = document.querySelector("title")?.firstChild;
    if (titleNode && originals.has(titleNode)) {
      titleNode.nodeValue = originals.get(titleNode);
      lastTranslated.delete(titleNode);
    }
  }

  function applyLanguage(lang) {
    if (!LANGS.some(item => item[0] === lang)) lang = "es";
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    if (observer) observer.disconnect();
    restoreAll();
    if (lang !== "es") {
      const walker = document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) translateNode(walker.currentNode,lang);
      const titleNode = document.querySelector("title")?.firstChild;
      if (titleNode) translateNode(titleNode,lang);
      translateElementAttributes(document.body,lang);
    }
    observe();
  }

  function processAdded(root) {
    const lang = current();
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) translateNode(root,lang);
    else if (root.nodeType === Node.ELEMENT_NODE) {
      const walker = document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) translateNode(walker.currentNode,lang);
      translateElementAttributes(root,lang);
    }
  }

  function observe() {
    if (!document.body) return;
    if (observer) observer.disconnect();
    observer = new MutationObserver(records => {
      if (current() === "es") return;
      let changed = false;
      records.forEach(record => {
        if (record.type === "characterData") {
          const node = record.target;
          if (!lastTranslated.has(node) || node.nodeValue !== lastTranslated.get(node)) {
            if (!scheduled) changed = true;
          }
        } else if (record.type === "childList") {
          record.addedNodes.forEach(processAdded);
        } else if (record.type === "attributes") {
          const el = record.target;
          const attr = record.attributeName;
          if (el.closest(skipAttributes)) return;
          let saved = attributeOriginals.get(el);
          if (!saved) { saved = {}; attributeOriginals.set(el,saved); }
          let last = attributeLast.get(el);
          if (!last) { last = {}; attributeLast.set(el,last); }
          if (attr === "value" && !el.matches("input[type=button],input[type=submit],input[type=reset]")) return;
          if (!["placeholder","aria-label","title","value"].includes(attr)) return;
          const actual = el.getAttribute(attr);
          if (last[attr] && actual === last[attr]) return;
          saved[attr] = actual;
          const next = translate(actual,current());
          if (next !== actual) {
            last[attr] = next;
            el.setAttribute(attr,next);
          }
        }
      });
      if (changed && !scheduled) {
        scheduled = true;
        queueMicrotask(() => {
          scheduled = false;
          const walker = document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            const node = walker.currentNode;
            if (lastTranslated.has(node) && node.nodeValue === lastTranslated.get(node)) continue;
            translateNode(node,current());
          }
        });
      }
    });
    observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["placeholder","aria-label","title","value"]});
  }

  function openPicker() {
    if (document.getElementById("ggLanguageModal")) return;
    const modal = document.createElement("div");
    modal.id = "ggLanguageModal";
    modal.innerHTML = '<div class="gg-language-backdrop" data-close-language></div><section class="gg-language-dialog" role="dialog" aria-modal="true" aria-labelledby="gg-language-title"><button class="gg-language-close" type="button" aria-label="Close" data-close-language>×</button><h2 id="gg-language-title">Idioma de la plataforma</h2><div class="gg-language-options"></div><button class="gg-language-save" type="button">Guardar idioma</button></section>';
    const style = document.createElement("style");
    style.textContent = '#ggLanguageModal{position:fixed;inset:0;z-index:20000;display:grid;place-items:center;padding:18px;font-family:Inter,Arial,sans-serif} .gg-language-backdrop{position:absolute;inset:0;background:#020713d9;backdrop-filter:blur(8px)} .gg-language-dialog{position:relative;width:min(100%,430px);max-height:min(88vh,720px);overflow:auto;padding:25px 20px 20px;border:1px solid #00c6ff88;border-radius:22px;background:linear-gradient(145deg,#0d2342,#081a35 68%,#050b18);box-shadow:0 18px 65px #000b,0 0 30px #00c6ff18;color:#f5f4f1} .gg-language-close{position:absolute;right:13px;top:10px;width:34px;height:34px;border:1px solid #ffffff22;border-radius:10px;background:#ffffff09;color:#f5f4f1;font-size:23px;cursor:pointer} .gg-language-dialog h2{margin:0 38px 8px 0;font-size:23px} .gg-language-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:19px 0} .gg-language-option{display:flex;align-items:center;gap:9px;min-height:47px;padding:9px 11px;border:1px solid #ffffff20;border-radius:12px;background:#ffffff08;color:#f5f4f1;font-size:13px;cursor:pointer} .gg-language-option:has(input:checked){border-color:#00c6ff;background:#00c6ff16;box-shadow:inset 0 0 12px #00c6ff0c} .gg-language-option input{accent-color:#00c6ff} .gg-language-save{width:100%;min-height:47px;border:1px solid #35dfff;border-radius:12px;background:linear-gradient(100deg,#007bff,#00c6ff);color:#041326;font-weight:900;font-size:14px;cursor:pointer} @media(max-width:360px){.gg-language-options{grid-template-columns:1fr}} @media(prefers-reduced-motion:reduce){#ggLanguageModal *{transition:none!important}}';
    document.head.appendChild(style);
    const options = modal.querySelector(".gg-language-options");
    LANGS.forEach(([code,label]) => {
      const row = document.createElement("label");
      row.className = "gg-language-option";
      const radio = document.createElement("input");
      radio.type = "radio"; radio.name = "gg-language"; radio.value = code; radio.checked = current() === code;
      const labelText = document.createElement("span"); labelText.textContent = label;
      row.append(radio,labelText); options.append(row);
    });
    const close = () => modal.remove();
    modal.querySelectorAll("[data-close-language]").forEach(el => el.addEventListener("click",close));
    modal.querySelector(".gg-language-save").addEventListener("click",() => {
      const chosen = modal.querySelector('input[name="gg-language"]:checked')?.value || "es";
      setStored(chosen); close(); applyLanguage(chosen);
    });
    document.body.appendChild(modal);
    processAdded(modal);
  }

  document.addEventListener("click",event => {
    const trigger = event.target.closest("[data-open-language]");
    if (trigger) { event.preventDefault(); openPicker(); }
  });

  function start() {
    const lang = current();
    applyLanguage(lang);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();

  window.GGLanguage = {
    get: current,
    set: lang => { if (LANGS.some(item => item[0] === lang)) { setStored(lang); applyLanguage(lang); } },
    open: openPicker,
    languages: LANGS,
    translate: (value,lang=current()) => translate(value,lang)
  };
})();