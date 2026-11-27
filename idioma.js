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
    ["Soporte",["Support","Suporte","Assistance","Support","Assistenza","Поддержка","客服支持","サポート","الدعم"]],
    ["Cuenta",["Account","Conta","Compte","Konto","Account","Аккаунт","账户","アカウント","الحساب"]],
    ["Atrás",["Back","Voltar","Retour","Zurück","Indietro","Назад","返回","戻る","رجوع"]],
    ["Guardar",["Save","Guardar","Enregistrer","Speichern","Salva","Сохранить","保存","保存","حفظ"]],
    ["Guardar cambios",["Save changes","Salvar alterações","Enregistrer les modifications","Änderungen speichern","Salva modifiche","Сохранить изменения","保存更改","変更を保存","حفظ التغييرات"]],
    ["Cancelar",["Cancel","Cancelar","Annuler","Abbrechen","Annulla","Отмена","取消","キャンセル","إلغاء"]],
    ["Cerrar",["Close","Fechar","Fermer","Schließen","Chiudi","Закрыть","关闭","閉じる","إغلاق"]],
    ["Idioma",["Language","Idioma","Langue","Sprache","Lingua","Язык","语言","言語","اللغة"]],
    ["Idioma de la plataforma",["Platform language","Idioma da plataforma","Langue de la plateforme","Plattformsprache","Lingua della piattaforma","Язык платформы","平台语言","プラットフォームの言語","لغة المنصة"]],
    ["Guardar idioma",["Save language","Salvar idioma","Enregistrer la langue","Sprache speichern","Salva lingua","Сохранить язык","保存语言","言語を保存","حفظ اللغة"]],
    ["Preferencias",["Preferences","Preferências","Préférences","Einstellungen","Preferenze","Настройки","偏好设置","設定","التفضيلات"]],
    ["Notificaciones",["Notifications","Notificações","Notifications","Benachrichtigungen","Notifiche","Уведомления","通知","通知","الإشعارات"]],
    ["Configuración",["Settings","Configurações","Paramètres","Einstellungen","Impostazioni","Настройки","设置","設定","الإعدادات"]],
    ["Mi cuenta",["My account","Minha conta","Mon compte","Mein Konto","Il mio account","Мой аккаунт","我的账户","マイアカウント","حسابي"]],
    ["Mi Cuenta",["My Account","Minha Conta","Mon compte","Mein Konto","Il mio Account","Мой аккаунт","我的账户","マイアカウント","حسابي"]],
    ["Datos personales",["Personal details","Dados pessoais","Données personnelles","Persönliche Daten","Dati personali","Личные данные","个人资料","個人情報","البيانات الشخصية"]],
    ["Métodos de acceso",["Login methods","Métodos de acesso","Méthodes de connexion","Anmeldemethoden","Metodi di accesso","Способы входа","登录方式","ログイン方法","طرق تسجيل الدخول"]],
    ["Seguridad",["Security","Segurança","Sécurité","Sicherheit","Sicurezza","Безопасность","安全","セキュリティ","الأمان"]],
    ["Mis Compras",["My Purchases","Minhas compras","Mes achats","Meine Käufe","I miei acquisti","Мои покупки","我的订单","購入履歴","مشترياتي"]],
    ["Mis compras",["My purchases","Minhas compras","Mes achats","Meine Käufe","I miei acquisti","Мои покупки","我的订单","購入履歴","مشترياتي"]],
    ["Mis Recompensas",["My Rewards","Minhas recompensas","Mes récompenses","Meine Prämien","I miei premi","Мои награды","我的奖励","マイ報酬","مكافآتي"]],
    ["Cerrar sesión",["Sign out","Sair","Se déconnecter","Abmelden","Esci","Выйти","退出登录","ログアウト","تسجيل الخروج"]],
    ["Saldo disponible",["Available balance","Saldo disponível","Solde disponible","Verfügbares Guthaben","Saldo disponibile","Доступный баланс","可用余额","利用可能残高","الرصيد المتاح"]],
    ["Añadir",["Add","Adicionar","Ajouter","Hinzufügen","Aggiungi","Добавить","添加","追加","إضافة"]],
    ["Cambiar foto",["Change photo","Alterar foto","Changer la photo","Foto ändern","Cambia foto","Изменить фото","更换照片","写真を変更","تغيير الصورة"]],
    ["Quitar foto",["Remove photo","Remover foto","Supprimer la photo","Foto entfernen","Rimuovi foto","Удалить фото","删除照片","写真を削除","إزالة الصورة"]],
    ["Región del juego",["Game region","Região do jogo","Région du jeu","Spielregion","Regione del gioco","Регион игры","游戏地区","ゲーム地域","منطقة اللعبة"]],
    ["Cargando regiones disponibles…",["Loading available regions…","Carregando regiões disponíveis…","Chargement des régions disponibles…","Verfügbare Regionen werden geladen…","Caricamento delle regioni disponibili…","Загрузка доступных регионов…","正在加载可用地区…","利用可能な地域を読み込み中…","جارٍ تحميل المناطق المتاحة…"]],
    ["Cargando regiones...",["Loading regions...","Carregando regiões...","Chargement des régions...","Regionen werden geladen...","Caricamento regioni...","Загрузка регионов...","正在加载地区...","地域を読み込み中...","جارٍ تحميل المناطق..."]],
    ["Tu Player ID",["Your Player ID","Seu Player ID","Votre Player ID","Deine Player-ID","Il tuo Player ID","Ваш Player ID","你的玩家 ID","プレイヤー ID","معرّف اللاعب"]],
    ["Tu UID",["Your UID","Seu UID","Votre UID","Deine UID","Il tuo UID","Ваш UID","你的 UID","UID","معرّف UID"]],
    ["Player ID",["Player ID","Player ID","Player ID","Player-ID","Player ID","Player ID","玩家 ID","プレイヤー ID","معرّف اللاعب"]],
    ["Player ID:",["Player ID:","Player ID:","Player ID :","Player-ID:","Player ID:","Player ID:","玩家 ID：","プレイヤー ID：","معرّف اللاعب:"]],
    ["Tu Character ID",["Your Character ID","Seu Character ID","Votre Character ID","Deine Character-ID","Il tuo Character ID","Ваш Character ID","你的角色 ID","キャラクター ID","معرّف الشخصية"]],
    ["Tu nombre de usuario",["Your username","Seu nome de usuário","Votre nom d’utilisateur","Dein Benutzername","Il tuo nome utente","Ваше имя пользователя","你的用户名","ユーザー名","اسم المستخدم"]],
    ["Recargar ahora",["Top up now","Recarregar agora","Recharger maintenant","Jetzt aufladen","Ricarica ora","Пополнить сейчас","立即充值","今すぐチャージ","اشحن الآن"]],
    ["Recargar",["Top up","Recarregar","Recharger","Aufladen","Ricarica","Пополнить","充值","チャージ","اشحن"]],
    ["Enviando pedido…",["Submitting order…","Enviando pedido…","Envoi de la commande…","Bestellung wird gesendet…","Invio dell’ordine…","Отправка заказа…","正在提交订单…","注文を送信中…","جارٍ إرسال الطلب…"]],
    ["Procesando pedido…",["Processing order…","Processando pedido…","Traitement de la commande…","Bestellung wird verarbeitet…","Elaborazione dell’ordine…","Обработка заказа…","正在处理订单…","注文を処理中…","جارٍ معالجة الطلب…"]],
    ["Pedido recibido",["Order received","Pedido recebido","Commande reçue","Bestellung erhalten","Ordine ricevuto","Заказ получен","订单已接收","注文を受け付けました","تم استلام الطلب"]],
    ["Pedido completado",["Order completed","Pedido concluído","Commande terminée","Bestellung abgeschlossen","Ordine completato","Заказ выполнен","订单已完成","注文が完了しました","اكتمل الطلب"]],
    ["Procesando",["Processing","Processando","En cours","In Bearbeitung","In elaborazione","Обработка","处理中","処理中","قيد المعالجة"]],
    ["Volver",["Go back","Voltar","Retour","Zurück","Indietro","Назад","返回","戻る","رجوع"]],
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
    ["Selecciona una tarjeta",["Select a card","Selecione um cartão","Sélectionnez une carte","Karte auswählen","Seleziona una carta","Выберите карту","选择一张卡","カードを選択","اختر بطاقة"]],
    ["1. Selecciona la región",["1. Select region","1. Selecione a região","1. Sélectionnez la région","1. Region auswählen","1. Seleziona la regione","1. Выберите регион","1. 选择地区","1. 地域を選択","1. اختر المنطقة"]],
    ["2. Correo de entrega",["2. Delivery email","2. E-mail de entrega","2. E-mail de livraison","2. E-Mail für Zustellung","2. E-mail di consegna","2. Почта для доставки","2. 收件邮箱","2. お届け先メール","2. بريد التسليم"]],
    ["3. Elige el importe",["3. Choose amount","3. Escolha o valor","3. Choisissez le montant","3. Betrag auswählen","3. Scegli l’importo","3. Выберите сумму","3. 选择金额","3. 金額を選択","3. اختر المبلغ"]],
    ["Cargando tarjetas disponibles...",["Loading available cards...","Carregando cartões disponíveis...","Chargement des cartes disponibles...","Verfügbare Karten werden geladen...","Caricamento delle carte disponibili...","Загрузка доступных карт...","正在加载可用卡片...","利用可能なカードを読み込み中...","جارٍ تحميل البطاقات المتاحة..."]],
    ["No hay tarjetas disponibles para esta región en este momento.",["No cards are available for this region right now.","Não há cartões disponíveis para esta região no momento.","Aucune carte n’est disponible pour cette région pour le moment.","Für diese Region sind derzeit keine Karten verfügbar.","Al momento non ci sono carte disponibili per questa regione.","В этом регионе сейчас нет доступных карт.","此地区目前没有可用卡片。","この地域では現在利用可能なカードがありません。","لا توجد بطاقات متاحة لهذه المنطقة حاليًا."]],
    ["Región del juego",["Game region","Região do jogo","Région du jeu","Spielregion","Regione del gioco","Регион игры","游戏地区","ゲーム地域","منطقة اللعبة"]],
    ["Bonos",["Bonuses","Bônus","Bonus","Boni","Bonus","Бонусы","奖励","ボーナス","المكافآت"]],
    ["Ofertas",["Offers","Ofertas","Offres","Angebote","Offerte","Предложения","优惠","オファー","العروض"]],
    ["Diamantes",["Diamonds","Diamantes","Diamants","Diamanten","Diamanti","Алмазы","钻石","ダイヤモンド","الماس"]],
    ["Cristales Génesis",["Genesis Crystals","Cristais Gênesis","Cristaux primaires","Urkristalle","Cristalli della Genesi","Кристаллы сотворения","创世结晶","創世結晶","بلورات التكوين"]],
    ["Tokens",["Tokens","Tokens","Jetons","Token","Token","Токены","代币","トークン","رموز"]],
    ["Gold",["Gold","Ouro","Or","Gold","Oro","Золото","金币","ゴールド","الذهب"]],
    ["UC",["UC","UC","UC","UC","UC","UC","UC","UC","UC"]],
    ["CP",["CP","CP","CP","CP","CP","CP","CP","CP","CP"]],
    ["No hay productos disponibles para esta región.",["No products are available for this region.","Não há produtos disponíveis para esta região.","Aucun produit n’est disponible pour cette région.","Für diese Region sind keine Produkte verfügbar.","Non ci sono prodotti disponibili per questa regione.","Для этого региона нет доступных товаров.","此地区没有可用商品。","この地域では利用可能な商品がありません。","لا توجد منتجات متاحة لهذه المنطقة."]],
    ["No hay productos disponibles en este momento. Vuelve a intentarlo más tarde.",["No products are available right now. Please try again later.","Não há produtos disponíveis no momento. Tente novamente mais tarde.","Aucun produit n’est disponible pour le moment. Réessayez plus tard.","Derzeit sind keine Produkte verfügbar. Bitte versuche es später erneut.","Al momento non ci sono prodotti disponibili. Riprova più tardi.","Сейчас нет доступных товаров. Попробуйте позже.","目前没有可用商品，请稍后重试。","現在利用可能な商品はありません。後でもう一度お試しください。","لا توجد منتجات متاحة حاليًا. حاول مرة أخرى لاحقًا."]],
    ["No pudimos cargar el catálogo. Comprueba tu conexión e inténtalo de nuevo.",["We couldn't load the catalog. Check your connection and try again.","Não foi possível carregar o catálogo. Verifique sua conexão e tente novamente.","Impossible de charger le catalogue. Vérifiez votre connexion et réessayez.","Der Katalog konnte nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.","Impossibile caricare il catalogo. Controlla la connessione e riprova.","Не удалось загрузить каталог. Проверьте подключение и попробуйте снова.","无法加载目录。请检查网络连接后重试。","カタログを読み込めませんでした。接続を確認して再試行してください。","تعذر تحميل الكتالوج. تحقق من اتصالك وحاول مرة أخرى."]],
    ["No se pudieron cargar las regiones.",["Couldn't load regions.","Não foi possível carregar as regiões.","Impossible de charger les régions.","Regionen konnten nicht geladen werden.","Impossibile caricare le regioni.","Не удалось загрузить регионы.","无法加载地区。","地域を読み込めませんでした。","تعذر تحميل المناطق."]],
    ["Reintentar",["Try again","Tentar novamente","Réessayer","Erneut versuchen","Riprova","Повторить","重试","再試行","إعادة المحاولة"]],
    ["Selecciona una región para cargar sus productos.",["Select a region to load its products.","Selecione uma região para carregar os produtos.","Sélectionnez une région pour charger ses produits.","Wähle eine Region, um ihre Produkte zu laden.","Seleziona una regione per caricare i prodotti.","Выберите регион, чтобы загрузить товары.","选择地区以加载商品。","商品を読み込む地域を選択してください。","اختر منطقة لتحميل منتجاتها."]],
    ["Regístrate",["Sign up","Cadastre-se","S’inscrire","Registrieren","Registrati","Зарегистрироваться","注册","新規登録","إنشاء حساب"]],
    ["Iniciar sesión",["Sign in","Entrar","Se connecter","Anmelden","Accedi","Войти","登录","ログイン","تسجيل الدخول"]],
    ["Inicia sesión",["Sign in","Entre","Connectez-vous","Melde dich an","Accedi","Войдите","登录","ログインしてください","سجّل الدخول"]],
    ["Iniciar sesión — INTERNACIONAL WEB",["Sign in — INTERNACIONAL WEB","Entrar — INTERNACIONAL WEB","Connexion — INTERNACIONAL WEB","Anmelden — INTERNACIONAL WEB","Accedi — INTERNACIONAL WEB","Вход — INTERNACIONAL WEB","登录 — INTERNACIONAL WEB","ログイン — INTERNACIONAL WEB","تسجيل الدخول — INTERNACIONAL WEB"]],
    ["CREAR CUENTA",["CREATE ACCOUNT","CRIAR CONTA","CRÉER UN COMPTE","KONTO ERSTELLEN","CREA ACCOUNT","СОЗДАТЬ АККАУНТ","创建账户","アカウント作成","إنشاء حساب"]],
    ["INICIAR SESIÓN",["SIGN IN","ENTRAR","SE CONNECTER","ANMELDEN","ACCEDI","ВОЙТИ","登录","ログイン","تسجيل الدخول"]],
    ["¿Olvidaste tu contraseña?",["Forgot your password?","Esqueceu sua senha?","Mot de passe oublié ?","Passwort vergessen?","Hai dimenticato la password?","Забыли пароль?","忘记密码？","パスワードをお忘れですか？","هل نسيت كلمة المرور؟"]],
    ["O CONTINÚA CON",["OR CONTINUE WITH","OU CONTINUE COM","OU CONTINUER AVEC","ODER WEITER MIT","OPPURE CONTINUA CON","ИЛИ ПРОДОЛЖИТЬ С","或使用以下方式继续","または次で続行","أو المتابعة باستخدام"]],
    ["¿Ya tienes una cuenta?",["Already have an account?","Já tem uma conta?","Vous avez déjà un compte ?","Hast du bereits ein Konto?","Hai già un account?","Уже есть аккаунт?","已有账户？","すでにアカウントをお持ちですか？","هل لديك حساب بالفعل؟"]],
    ["¿Todavía no tienes cuenta?",["Don't have an account yet?","Ainda não tem uma conta?","Vous n’avez pas encore de compte ?","Noch kein Konto?","Non hai ancora un account?","Еще нет аккаунта?","还没有账户？","まだアカウントをお持ちでないですか？","ليس لديك حساب بعد؟"]],
    ["Datos personales",["Personal details","Dados pessoais","Données personnelles","Persönliche Daten","Dati personali","Личные данные","个人资料","個人情報","البيانات الشخصية"]],
    ["Nombre y apellidos",["First and last name","Nome e sobrenome","Nom et prénom","Vor- und Nachname","Nome e cognome","Имя и фамилия","姓名","氏名","الاسم الكامل"]],
    ["Número de teléfono",["Phone number","Número de telefone","Numéro de téléphone","Telefonnummer","Numero di telefono","Номер телефона","电话号码","電話番号","رقم الهاتف"]],
    ["Correo electrónico",["Email address","E-mail","Adresse e-mail","E-Mail-Adresse","Indirizzo e-mail","Электронная почта","电子邮箱","メールアドレス","البريد الإلكتروني"]],
    ["GUARDAR CAMBIOS",["SAVE CHANGES","SALVAR ALTERAÇÕES","ENREGISTRER LES MODIFICATIONS","ÄNDERUNGEN SPEICHERN","SALVA MODIFICHE","СОХРАНИТЬ ИЗМЕНЕНИЯ","保存更改","変更を保存","حفظ التغييرات"]],
    ["Compras",["Purchases","Compras","Achats","Käufe","Acquisti","Покупки","购买","購入","المشتريات"]],
    ["Depósitos",["Deposits","Depósitos","Dépôts","Einzahlungen","Depositi","Пополнения","充值记录","入金","الإيداعات"]],
    ["Entregadas",["Delivered","Entregues","Livrées","Zugestellt","Consegnate","Доставлено","已交付","配達済み","تم التسليم"]],
    ["En curso",["In progress","Em andamento","En cours","In Bearbeitung","In corso","В процессе","进行中","進行中","قيد التنفيذ"]],
    ["Este mes",["This month","Este mês","Ce mois-ci","Diesen Monat","Questo mese","В этом месяце","本月","今月","هذا الشهر"]],
    ["Todos",["All","Todos","Tout","Alle","Tutti","Все","全部","すべて","الكل"]],
    ["Completados",["Completed","Concluídos","Terminés","Abgeschlossen","Completati","Завершено","已完成","完了","مكتمل"]],
    ["Pendientes",["Pending","Pendentes","En attente","Ausstehend","In sospeso","Ожидает","待处理","保留中","قيد الانتظار"]],
    ["Revisión",["Review","Revisão","Vérification","Prüfung","Revisione","Проверка","审核","確認中","مراجعة"]],
    ["Sin recargas todavía",["No top-ups yet","Ainda não há recargas","Aucune recharge pour le moment","Noch keine Aufladungen","Nessuna ricarica","Пополнений пока нет","暂无充值记录","チャージ履歴はまだありません","لا توجد عمليات شحن بعد"]],
    ["No disponible",["Unavailable","Indisponível","Indisponible","Nicht verfügbar","Non disponibile","Недоступно","不可用","利用不可","غير متاح"]],
    ["Cargando reseñas…",["Loading reviews…","Carregando avaliações…","Chargement des avis…","Bewertungen werden geladen…","Caricamento recensioni…","Загрузка отзывов…","正在加载评价…","レビューを読み込み中…","جارٍ تحميل التقييمات…"]],
    ["Crear reseña",["Write a review","Criar avaliação","Rédiger un avis","Bewertung schreiben","Scrivi una recensione","Оставить отзыв","撰写评价","レビューを書く","اكتب تقييمًا"]],
    ["Comparte tu experiencia",["Share your experience","Compartilhe sua experiência","Partagez votre expérience","Teile deine Erfahrung","Condividi la tua esperienza","Поделитесь впечатлениями","分享你的体验","体験を共有してください","شارك تجربتك"]],
    ["Título de tu reseña",["Review title","Título da avaliação","Titre de votre avis","Titel deiner Bewertung","Titolo della recensione","Заголовок отзыва","评价标题","レビューのタイトル","عنوان تقييمك"]],
    ["Tu opinión",["Your review","Sua opinião","Votre avis","Deine Meinung","La tua opinione","Ваш отзыв","你的评价","あなたの意見","رأيك"]],
    ["Publicar reseña",["Post review","Publicar avaliação","Publier l’avis","Bewertung veröffentlichen","Pubblica recensione","Опубликовать отзыв","发布评价","レビューを投稿","نشر التقييم"]],
    ["Limpiar",["Clear","Limpar","Effacer","Leeren","Pulisci","Очистить","清除","クリア","مسح"]],
    ["Activar notificaciones",["Enable notifications","Ativar notificações","Activer les notifications","Benachrichtigungen aktivieren","Attiva notifiche","Включить уведомления","开启通知","通知を有効にする","تفعيل الإشعارات"]],
    ["Todo al día",["All caught up","Tudo em dia","Tout est à jour","Alles auf dem neuesten Stand","Tutto aggiornato","Все обновлено","一切正常","すべて最新です","كل شيء محدّث"]],
    ["Guardar preferencias",["Save preferences","Salvar preferências","Enregistrer les préférences","Einstellungen speichern","Salva preferenze","Сохранить настройки","保存偏好设置","設定を保存","حفظ التفضيلات"]],
    ["Cambiar contraseña",["Change password","Alterar senha","Changer le mot de passe","Passwort ändern","Cambia password","Изменить пароль","更改密码","パスワードを変更","تغيير كلمة المرور"]],
    ["Actualizar contraseña",["Update password","Atualizar senha","Mettre à jour le mot de passe","Passwort aktualisieren","Aggiorna password","Обновить пароль","更新密码","パスワードを更新","تحديث كلمة المرور"]],
    ["Verificación en dos pasos",["Two-step verification","Verificação em duas etapas","Vérification en deux étapes","Zwei-Faktor-Authentifizierung","Verifica in due passaggi","Двухэтапная проверка","两步验证","2段階認証","التحقق بخطوتين"]],
    ["Comprobando estado...",["Checking status...","Verificando status...","Vérification de l’état...","Status wird geprüft...","Verifica dello stato...","Проверка статуса...","正在检查状态...","状態を確認中...","جارٍ التحقق من الحالة..."]],
    ["CONFIRMAR Y ACTIVAR",["CONFIRM AND ENABLE","CONFIRMAR E ATIVAR","CONFIRMER ET ACTIVER","BESTÄTIGEN UND AKTIVIEREN","CONFERMA E ATTIVA","ПОДТВЕРДИТЬ И ВКЛЮЧИТЬ","确认并启用","確認して有効化","تأكيد وتفعيل"]],
    ["DESACTIVAR",["DISABLE","DESATIVAR","DÉSACTIVER","DEAKTIVIEREN","DISATTIVA","ОТКЛЮЧИТЬ","停用","無効にする","تعطيل"]],
    ["ACTIVAR APP DE CÓDIGOS",["ENABLE AUTHENTICATOR APP","ATIVAR APP DE CÓDIGOS","ACTIVER L’APPLICATION D’AUTHENTIFICATION","AUTHENTICATOR-APP AKTIVIEREN","ATTIVA APP DI AUTENTICAZIONE","ВКЛЮЧИТЬ ПРИЛОЖЕНИЕ-КОДЫ","启用验证器应用","認証アプリを有効化","تفعيل تطبيق المصادقة"]],
    ["Centro de ayuda",["Help center","Central de ajuda","Centre d’aide","Hilfezentrum","Centro assistenza","Центр помощи","帮助中心","ヘルプセンター","مركز المساعدة"]],
    ["Mis tickets",["My tickets","Meus chamados","Mes tickets","Meine Tickets","I miei ticket","Мои обращения","我的工单","マイチケット","تذاكري"]],
    ["Cargando tickets…",["Loading tickets…","Carregando chamados…","Chargement des tickets…","Tickets werden geladen…","Caricamento ticket…","Загрузка обращений…","正在加载工单…","チケットを読み込み中…","جارٍ تحميل التذاكر…"]],
    ["＋ Nuevo ticket",["＋ New ticket","＋ Novo chamado","＋ Nouveau ticket","＋ Neues Ticket","＋ Nuovo ticket","＋ Новое обращение","＋ 新建工单","＋ 新しいチケット","＋ تذكرة جديدة"]],
    ["Enviar ticket",["Submit ticket","Enviar chamado","Envoyer le ticket","Ticket senden","Invia ticket","Отправить обращение","提交工单","チケットを送信","إرسال التذكرة"]],
    ["Enviar",["Send","Enviar","Envoyer","Senden","Invia","Отправить","发送","送信","إرسال"]],
    ["Asunto",["Subject","Assunto","Sujet","Betreff","Oggetto","Тема","主题","件名","الموضوع"]],
    ["Categoría",["Category","Categoria","Catégorie","Kategorie","Categoria","Категория","类别","カテゴリー","الفئة"]],
    ["Mensaje",["Message","Mensagem","Message","Nachricht","Messaggio","Сообщение","消息","メッセージ","الرسالة"]],
    ["Cuenta",["Account","Conta","Compte","Konto","Account","Аккаунт","账户","アカウント","الحساب"]],
    ["Pagos",["Payments","Pagamentos","Paiements","Zahlungen","Pagamenti","Платежи","付款","支払い","المدفوعات"]],
    ["Recargas",["Top-ups","Recargas","Recharges","Aufladungen","Ricariche","Пополнения","充值","チャージ","عمليات الشحن"]],
    ["Problemas técnicos",["Technical issues","Problemas técnicos","Problèmes techniques","Technische Probleme","Problemi tecnici","Технические проблемы","技术问题","技術的な問題","مشكلات تقنية"]],
    ["Otro",["Other","Outro","Autre","Sonstiges","Altro","Другое","其他","その他","أخرى"]],
    ["Acceso exclusivo",["Exclusive access","Acesso exclusivo","Accès exclusif","Exklusiver Zugriff","Accesso esclusivo","Эксклюзивный доступ","专属访问","限定アクセス","وصول حصري"]],
    ["Volver a mi cuenta",["Back to my account","Voltar à minha conta","Retour à mon compte","Zurück zu meinem Konto","Torna al mio account","Вернуться в аккаунт","返回我的账户","アカウントに戻る","العودة إلى حسابي"]],
    ["Lista de precios",["Price list","Lista de preços","Liste de prix","Preisliste","Listino prezzi","Прайс-лист","价格表","価格一覧","قائمة الأسعار"]],
    ["Copiar",["Copy","Copiar","Copier","Kopieren","Copia","Копировать","复制","コピー","نسخ"]],
    ["Copiar precios visibles",["Copy visible prices","Copiar preços visíveis","Copier les prix visibles","Sichtbare Preise kopieren","Copia i prezzi visibili","Скопировать видимые цены","复制可见价格","表示中の価格をコピー","نسخ الأسعار الظاهرة"]],
    ["No hay productos disponibles para este juego.",["No products are available for this game.","Não há produtos disponíveis para este jogo.","Aucun produit n’est disponible pour ce jeu.","Für dieses Spiel sind keine Produkte verfügbar.","Non ci sono prodotti disponibili per questo gioco.","Для этой игры нет доступных товаров.","此游戏暂无可用商品。","このゲームには利用可能な商品がありません。","لا توجد منتجات متاحة لهذه اللعبة."]],
    ["Pedido creado. Envía exactamente",["Order created. Send exactly","Pedido criado. Envie exatamente","Commande créée. Envoyez exactement","Bestellung erstellt. Sende genau","Ordine creato. Invia esattamente","Заказ создан. Отправьте точно","订单已创建。请准确发送","注文を作成しました。正確に送金してください","تم إنشاء الطلب. أرسل بالضبط"]],
    ["Dirección de pago",["Payment address","Endereço de pagamento","Adresse de paiement","Zahlungsadresse","Indirizzo di pagamento","Платежный адрес","付款地址","支払いアドレス","عنوان الدفع"]],
    ["Pagar",["Pay","Pagar","Payer","Bezahlen","Paga","Оплатить","支付","支払う","ادفع"]],
    ["PAGO CONFIRMADO",["PAYMENT CONFIRMED","PAGAMENTO CONFIRMADO","PAIEMENT CONFIRMÉ","ZAHLUNG BESTÄTIGT","PAGAMENTO CONFERMATO","ПЛАТЕЖ ПОДТВЕРЖДЕН","付款已确认","支払い確認済み","تم تأكيد الدفع"]]

    ,["Recarga, juega sin límites",["Top up, play without limits","Recarregue, jogue sem limites","Rechargez, jouez sans limites","Aufladen, spielen ohne Grenzen","Ricarica, gioca senza limiti","Пополняй, играй без ограничений","充值畅玩，无拘无束","チャージして、思いきりプレイ","اشحن والعب بلا حدود"]]
    ,["Tu plataforma global de recargas gaming.",["Your global gaming top-up platform.","Sua plataforma global de recargas para jogos.","Votre plateforme mondiale de recharge gaming.","Deine globale Plattform für Gaming-Aufladungen.","La tua piattaforma globale di ricariche gaming.","Глобальная платформа игровых пополнений.","全球游戏充值平台。","グローバルなゲームチャージプラットフォーム。","منصتك العالمية لشحن الألعاب."]]
    ,["Explorar Tienda",["Explore Store","Explorar loja","Explorer la boutique","Shop entdecken","Esplora il negozio","Перейти в магазин","浏览商店","ストアを見る","استكشف المتجر"]]
    ,["Nuestros Juegos",["Our Games","Nossos jogos","Nos jeux","Unsere Spiele","I nostri giochi","Наши игры","我们的游戏","ゲーム一覧","ألعابنا"]]
    ,["Recargas instantáneas para tus juegos favoritos",["Instant top-ups for your favorite games","Recargas instantâneas para seus jogos favoritos","Recharges instantanées pour vos jeux préférés","Sofortige Aufladungen für deine Lieblingsspiele","Ricariche istantanee per i tuoi giochi preferiti","Мгновенное пополнение любимых игр","为你喜爱的游戏即时充值","お気に入りのゲームに即時チャージ","شحن فوري لألعابك المفضلة"]]
    ,["Ver todos",["View all","Ver todos","Tout voir","Alle anzeigen","Vedi tutti","Смотреть все","查看全部","すべて表示","عرض الكل"]]
    ,["Todos",["All","Todos","Tout","Alle","Tutti","Все","全部","すべて","الكل"]]
    ,["Móvil",["Mobile","Celular","Mobile","Mobil","Mobile","Мобильные","手机","モバイル","الهاتف المحمول"]]
    ,["Gift cards",["Gift cards","Cartões-presente","Cartes cadeaux","Geschenkkarten","Carte regalo","Подарочные карты","礼品卡","ギフトカード","بطاقات الهدايا"]]
    ,["Tarjetas de regalo",["Gift cards","Cartões-presente","Cartes cadeaux","Geschenkkarten","Carte regalo","Подарочные карты","礼品卡","ギフトカード","بطاقات الهدايا"]]
    ,["Servicios",["Services","Serviços","Services","Dienstleistungen","Servizi","Услуги","服务","サービス","الخدمات"]]
    ,["Esta categoría todavía no tiene productos publicados.",["This category has no published products yet.","Esta categoria ainda não tem produtos publicados.","Cette catégorie ne contient pas encore de produits publiés.","In dieser Kategorie wurden noch keine Produkte veröffentlicht.","Questa categoria non ha ancora prodotti pubblicati.","В этой категории пока нет опубликованных товаров.","此类别尚未发布商品。","このカテゴリーにはまだ商品がありません。","لا توجد منتجات منشورة في هذه الفئة حتى الآن."]]
    ,["1. Selecciona la región",["1. Select region","1. Selecione a região","1. Sélectionnez la région","1. Region auswählen","1. Seleziona la regione","1. Выберите регион","1. 选择地区","1. 地域を選択","1. اختر المنطقة"]]
    ,["2. Correo de entrega",["2. Delivery email","2. E-mail de entrega","2. E-mail de livraison","2. E-Mail für Zustellung","2. E-mail di consegna","2. Почта для доставки","2. 收件邮箱","2. お届け先メール","2. بريد التسليم"]]
    ,["3. Elige el importe",["3. Choose amount","3. Escolha o valor","3. Choisissez le montant","3. Betrag auswählen","3. Scegli l’importo","3. Выберите сумму","3. 选择金额","3. 金額を選択","3. اختر المبلغ"]]
    ,["Selecciona una tarjeta",["Select a card","Selecione um cartão","Sélectionnez une carte","Karte auswählen","Seleziona una carta","Выберите карту","选择一张卡","カードを選択","اختر بطاقة"]]
    ,["Cargando tarjetas Steam disponibles...",["Loading available Steam cards...","Carregando cartões Steam disponíveis...","Chargement des cartes Steam disponibles...","Verfügbare Steam-Karten werden geladen...","Caricamento delle carte Steam disponibili...","Загрузка доступных карт Steam...","正在加载可用 Steam 卡...","利用可能なSteamカードを読み込み中...","جارٍ تحميل بطاقات Steam المتاحة..."]]
    ,["Cargando tarjetas Google Play disponibles...",["Loading available Google Play cards...","Carregando cartões Google Play disponíveis...","Chargement des cartes Google Play disponibles...","Verfügbare Google Play-Karten werden geladen...","Caricamento delle carte Google Play disponibili...","Загрузка доступных карт Google Play...","正在加载可用 Google Play 卡...","利用可能なGoogle Playカードを読み込み中...","جارٍ تحميل بطاقات Google Play المتاحة..."]]
    ,["Cargando tarjetas PlayStation disponibles...",["Loading available PlayStation cards...","Carregando cartões PlayStation disponíveis...","Chargement des cartes PlayStation disponibles...","Verfügbare PlayStation-Karten werden geladen...","Caricamento delle carte PlayStation disponibili...","Загрузка доступных карт PlayStation...","正在加载可用 PlayStation 卡...","利用可能なPlayStationカードを読み込み中...","جارٍ تحميل بطاقات PlayStation المتاحة..."]]
    ,["Cargando tarjetas Xbox disponibles...",["Loading available Xbox cards...","Carregando cartões Xbox disponíveis...","Chargement des cartes Xbox disponibles...","Verfügbare Xbox-Karten werden geladen...","Caricamento delle carte Xbox disponibili...","Загрузка доступных карт Xbox...","正在加载可用 Xbox 卡...","利用可能なXboxカードを読み込み中...","جارٍ تحميل بطاقات Xbox المتاحة..."]]
    ,["Cargando tarjetas Nintendo disponibles...",["Loading available Nintendo cards...","Carregando cartões Nintendo disponíveis...","Chargement des cartes Nintendo disponibles...","Verfügbare Nintendo-Karten werden geladen...","Caricamento delle carte Nintendo disponibili...","Загрузка доступных карт Nintendo...","正在加载可用 Nintendo 卡...","利用可能なNintendoカードを読み込み中...","جارٍ تحميل بطاقات Nintendo المتاحة..."]]
    ,["No se pudieron cargar las regiones",["Regions couldn't be loaded","Não foi possível carregar as regiões","Impossible de charger les régions","Regionen konnten nicht geladen werden","Impossibile caricare le regioni","Не удалось загрузить регионы","无法加载地区","地域を読み込めませんでした","تعذر تحميل المناطق"]]
    ,["No pudimos cargar las tarjetas Steam. Comprueba tu conexión e inténtalo de nuevo.",["We couldn't load Steam cards. Check your connection and try again.","Não foi possível carregar os cartões Steam. Verifique sua conexão e tente novamente.","Impossible de charger les cartes Steam. Vérifiez votre connexion et réessayez.","Steam-Karten konnten nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.","Impossibile caricare le carte Steam. Controlla la connessione e riprova.","Не удалось загрузить карты Steam. Проверьте подключение и попробуйте снова.","无法加载 Steam 卡。请检查网络连接后重试。","Steamカードを読み込めませんでした。接続を確認して再試行してください。","تعذر تحميل بطاقات Steam. تحقق من اتصالك وحاول مرة أخرى."]]
    ,["Estamos cargando los datos reales de tu pedido…",["We're loading your actual order details…","Estamos carregando os dados reais do seu pedido…","Nous chargeons les détails réels de votre commande…","Wir laden die tatsächlichen Bestelldaten…","Stiamo caricando i dati reali del tuo ordine…","Загружаем фактические данные заказа…","正在加载订单的实际信息…","注文の実際の詳細を読み込んでいます…","جارٍ تحميل بيانات طلبك الفعلية…"]]
    ,["Puedes consultar este pedido en",["You can view this order in","Você pode consultar este pedido em","Vous pouvez consulter cette commande dans","Du kannst diese Bestellung hier einsehen:","Puoi consultare questo ordine in","Вы можете посмотреть этот заказ в разделе","你可以在此处查看此订单","この注文は次の場所で確認できます","يمكنك الاطلاع على هذا الطلب في"]]
    ,["Si necesitas ayuda,",["If you need help,","Se precisar de ajuda,","Si vous avez besoin d’aide,","Wenn du Hilfe benötigst,","Se hai bisogno di aiuto,","Если вам нужна помощь,","如果你需要帮助，","サポートが必要な場合は、","إذا كنت بحاجة إلى مساعدة،"]]
    ,["contacta con soporte",["contact support","entre em contato com o suporte","contactez le support","wende dich an den Support","contatta l’assistenza","обратитесь в поддержку","联系客户支持","サポートにお問い合わせください","تواصل مع الدعم"]]
    ,["No pudimos cargar tu pedido",["We couldn't load your order","Não foi possível carregar seu pedido","Impossible de charger votre commande","Deine Bestellung konnte nicht geladen werden","Impossibile caricare il tuo ordine","Не удалось загрузить ваш заказ","无法加载你的订单","注文を読み込めませんでした","تعذر تحميل طلبك"]]
    ,["Comprueba tu conexión e inténtalo de nuevo.",["Check your connection and try again.","Verifique sua conexão e tente novamente.","Vérifiez votre connexion et réessayez.","Prüfe deine Verbindung und versuche es erneut.","Controlla la connessione e riprova.","Проверьте подключение и попробуйте снова.","请检查网络连接后重试。","接続を確認して再試行してください。","تحقق من اتصالك وحاول مرة أخرى."]]
    ,["No hay recargas todavía",["No top-ups yet","Ainda não há recargas","Aucune recharge pour le moment","Noch keine Aufladungen","Nessuna ricarica","Пополнений пока нет","暂无充值记录","チャージ履歴はまだありません","لا توجد عمليات شحن بعد"]]
    ,["Aquí aparecerán tus compras y recargas de juegos cuando realices una.",["Your purchases and game top-ups will appear here once you make one.","Suas compras e recargas de jogos aparecerão aqui quando você fizer uma.","Vos achats et recharges de jeux apparaîtront ici après votre première opération.","Deine Käufe und Spielaufladungen erscheinen hier, sobald du einen Kauf tätigst.","I tuoi acquisti e le ricariche dei giochi appariranno qui dopo il primo acquisto.","Здесь будут отображаться ваши покупки и игровые пополнения.","完成购买后，你的订单和游戏充值记录会显示在这里。","購入すると、ここに購入履歴とゲームチャージが表示されます。","ستظهر مشترياتك وعمليات شحن الألعاب هنا بعد تنفيذ أول عملية."]]
    ,["Sin depósitos todavía",["No deposits yet","Ainda não há depósitos","Aucun dépôt pour le moment","Noch keine Einzahlungen","Nessun deposito","Пополнений баланса пока нет","暂无充值记录","入金履歴はまだありません","لا توجد إيداعات بعد"]]
    ,["Aquí encontrarás el historial de tus depósitos y movimientos de USDT.",["Here you'll find your USDT deposit and transaction history.","Aqui você encontrará o histórico de depósitos e movimentações de USDT.","Vous trouverez ici l’historique de vos dépôts et mouvements en USDT.","Hier findest du den Verlauf deiner USDT-Einzahlungen und Transaktionen.","Qui troverai la cronologia dei depositi e dei movimenti USDT.","Здесь будет история ваших депозитов и операций с USDT.","你可以在这里查看 USDT 充值和交易记录。","ここでUSDTの入金と取引履歴を確認できます。","ستجد هنا سجل إيداعاتك وحركات USDT."]]
    ,["Información de tu perfil",["Your profile information","Informações do seu perfil","Informations de votre profil","Deine Profilinformationen","Informazioni del tuo profilo","Информация о вашем профиле","你的个人资料信息","プロフィール情報","معلومات ملفك الشخصي"]]
    ,["Estos datos identifican tu cuenta",["These details identify your account","Esses dados identificam sua conta","Ces informations identifient votre compte","Diese Daten identifizieren dein Konto","Questi dati identificano il tuo account","Эти данные идентифицируют ваш аккаунт","这些信息用于识别你的账户","これらの情報はアカウントを識別します","تُعرّف هذه البيانات حسابك"]]
    ,["Elige qué avisos quieres recibir en tu teléfono",["Choose which alerts you want to receive on your phone","Escolha quais avisos deseja receber no seu telefone","Choisissez les alertes que vous souhaitez recevoir sur votre téléphone","Wähle aus, welche Benachrichtigungen du auf deinem Telefon erhalten möchtest","Scegli quali avvisi vuoi ricevere sul telefono","Выберите уведомления, которые хотите получать на телефон","选择你希望在手机上接收的提醒","スマートフォンで受け取る通知を選択してください","اختر التنبيهات التي تريد تلقيها على هاتفك"]]
    ,["Comprueba los dispositivos donde has iniciado sesión",["Review the devices where you're signed in","Confira os dispositivos em que você iniciou sessão","Vérifiez les appareils sur lesquels vous êtes connecté","Überprüfe die Geräte, auf denen du angemeldet bist","Controlla i dispositivi su cui hai effettuato l’accesso","Проверьте устройства, на которых выполнен вход","查看已登录的设备","ログイン中のデバイスを確認","راجع الأجهزة التي سجلت الدخول منها"]]
    ,["Información y detalles de INTERNACIONAL WEB",["Information and details about INTERNACIONAL WEB","Informações e detalhes da INTERNACIONAL WEB","Informations et détails sur INTERNACIONAL WEB","Informationen und Details zu INTERNACIONAL WEB","Informazioni e dettagli su INTERNACIONAL WEB","Информация и сведения о INTERNACIONAL WEB","关于 INTERNACIONAL WEB 的信息和详情","INTERNACIONAL WEBの情報と詳細","معلومات وتفاصيل حول INTERNACIONAL WEB"]]
    ,["UN MUNDO DE BENEFICIOS",["A WORLD OF BENEFITS","UM MUNDO DE BENEFÍCIOS","UN MONDE D’AVANTAGES","EINE WELT VOLLER VORTEILE","UN MONDO DI VANTAGGI","МИР ПРЕИМУЩЕСТВ","福利世界","特典の世界","عالم من المزايا"]]
    ,["¡Tus recompensas te esperan!",["Your rewards are waiting!","Suas recompensas estão esperando!","Vos récompenses vous attendent !","Deine Prämien warten auf dich!","I tuoi premi ti aspettano!","Ваши награды ждут вас!","你的奖励正在等你！","報酬があなたを待っています！","مكافآتك بانتظارك!"]]
    ,["Comparte tu enlace e invita amigos para ganar recompensas.",["Share your link and invite friends to earn rewards.","Compartilhe seu link e convide amigos para ganhar recompensas.","Partagez votre lien et invitez des amis pour gagner des récompenses.","Teile deinen Link und lade Freunde ein, um Prämien zu erhalten.","Condividi il link e invita gli amici per ottenere premi.","Делитесь ссылкой и приглашайте друзей, чтобы получать награды.","分享链接并邀请好友赚取奖励。","リンクを共有して友達を招待し、報酬を獲得しましょう。","شارك رابطك وادعُ أصدقاءك لكسب المكافآت."]]
    ,["＋ Nuevo ticket",["＋ New ticket","＋ Novo chamado","＋ Nouveau ticket","＋ Neues Ticket","＋ Nuovo ticket","＋ Новое обращение","＋ 新建工单","＋ 新しいチケット","＋ تذكرة جديدة"]]
    ,["Tu satisfacción es nuestra prioridad",["Your satisfaction is our priority","Sua satisfação é nossa prioridade","Votre satisfaction est notre priorité","Deine Zufriedenheit hat für uns Priorität","La tua soddisfazione è la nostra priorità","Ваше удовлетворение — наш приоритет","您的满意是我们的首要任务","お客様の満足が私たちの最優先事項です","رضاك هو أولويتنا"]]
    ,["Preguntas frecuentes",["Frequently asked questions","Perguntas frequentes","Questions fréquentes","Häufig gestellte Fragen","Domande frequenti","Часто задаваемые вопросы","常见问题","よくある質問","الأسئلة الشائعة"]]
    ,["¿Cómo puedo contactar al equipo de soporte?",["How can I contact the support team?","Como posso entrar em contato com a equipe de suporte?","Comment puis-je contacter l’équipe d’assistance ?","Wie kann ich das Support-Team kontaktieren?","Come posso contattare il team di assistenza?","Как связаться со службой поддержки?","如何联系客户支持团队？","サポートチームに連絡するにはどうすればよいですか？","كيف يمكنني التواصل مع فريق الدعم؟"]]
    ,["¿Dónde puedo consultar mis compras?",["Where can I view my purchases?","Onde posso consultar minhas compras?","Où puis-je consulter mes achats ?","Wo kann ich meine Käufe einsehen?","Dove posso consultare i miei acquisti?","Где я могу посмотреть свои покупки?","在哪里可以查看我的订单？","購入履歴はどこで確認できますか？","أين يمكنني الاطلاع على مشترياتي؟"]]
    ,["Programa de referidos",["Referral program","Programa de indicações","Programme de parrainage","Empfehlungsprogramm","Programma referral","Реферальная программа","推荐计划","紹介プログラム","برنامج الإحالة"]]
    ,["Gana el 5% de la primera compra",["Earn 5% from the first purchase","Ganhe 5% da primeira compra","Gagnez 5 % sur le premier achat","Verdiene 5 % beim ersten Kauf","Guadagna il 5% sul primo acquisto","Получите 5% от первой покупки","从首次购买中赚取 5%","初回購入の5%を獲得","اكسب 5٪ من أول عملية شراء"]]
    ,["COPIAR",["COPY","COPIAR","COPIER","KOPIEREN","COPIA","КОПИРОВАТЬ","复制","コピー","نسخ"]]
    ,["Cargando tus referidos...",["Loading your referrals...","Carregando suas indicações...","Chargement de vos filleuls...","Deine Empfehlungen werden geladen...","Caricamento dei tuoi referral...","Загрузка ваших приглашений...","正在加载你的推荐记录...","紹介情報を読み込み中...","جارٍ تحميل إحالاتك..."]]
    ,["TU PERFIL",["YOUR PROFILE","SEU PERFIL","VOTRE PROFIL","DEIN PROFIL","IL TUO PROFILO","ВАШ ПРОФИЛЬ","个人资料","プロフィール","ملفك الشخصي"]]
    ,["CONFIGURACIÓN",["SETTINGS","CONFIGURAÇÕES","PARAMÈTRES","EINSTELLUNGEN","IMPOSTAZIONI","НАСТРОЙКИ","设置","設定","الإعدادات"]]
    ,["DATOS PERSONALES",["PERSONAL DETAILS","DADOS PESSOAIS","DONNÉES PERSONNELLES","PERSÖNLICHE DATEN","DATI PERSONALI","ЛИЧНЫЕ ДАННЫЕ","个人资料","個人情報","البيانات الشخصية"]]
    ,["MÉTODOS DE ACCESO",["LOGIN METHODS","MÉTODOS DE ACESSO","MÉTHODES DE CONNEXION","ANMELDEMETHODEN","METODI DI ACCESSO","СПОСОБЫ ВХОДА","登录方式","ログイン方法","طرق تسجيل الدخول"]]
    ,["SEGURIDAD",["SECURITY","SEGURANÇA","SÉCURITÉ","SICHERHEIT","SICUREZZA","БЕЗОПАСНОСТЬ","安全","セキュリティ","الأمان"]]
    ,["MIS COMPRAS",["MY PURCHASES","MINHAS COMPRAS","MES ACHATS","MEINE KÄUFE","I MIEI ACQUISTI","МОИ ПОКУПКИ","我的订单","購入履歴","مشترياتي"]]
    ,["MIS RECOMPENSAS",["MY REWARDS","MINHAS RECOMPENSAS","MES RÉCOMPENSES","MEINE PRÄMIEN","I MIEI PREMI","МОИ НАГРАДЫ","我的奖励","マイ報酬","مكافآتي"]]
    ,["RESEÑAS",["REVIEWS","AVALIAÇÕES","AVIS","BEWERTUNGEN","RECENSIONI","ОТЗЫВЫ","评价","レビュー","التقييمات"]]
    ,["NOTIFICACIONES",["NOTIFICATIONS","NOTIFICAÇÕES","NOTIFICATIONS","BENACHRICHTIGUNGEN","NOTIFICHE","УВЕДОМЛЕНИЯ","通知","通知","الإشعارات"]]
    ,["SOPORTE",["SUPPORT","SUPORTE","ASSISTANCE","SUPPORT","ASSISTENZA","ПОДДЕРЖКА","客服支持","サポート","الدعم"]]
    ,["MIS INVITADOS",["MY REFERRALS","MEUS CONVIDADOS","MES FILLEULS","MEINE EMPFEHLUNGEN","I MIEI INVITATI","МОИ ПРИГЛАШЕННЫЕ","我的邀请","招待した友達","المدعوون لدي"]]
    ,["TU ENLACE PERSONAL",["YOUR PERSONAL LINK","SEU LINK PESSOAL","VOTRE LIEN PERSONNEL","DEIN PERSÖNLICHER LINK","IL TUO LINK PERSONALE","ВАША ЛИЧНАЯ ССЫЛКА","你的专属链接","あなた専用リンク","رابطك الشخصي"]]
    ,["¿CÓMO FUNCIONA?",["HOW DOES IT WORK?","COMO FUNCIONA?","COMMENT ÇA MARCHE ?","WIE FUNKTIONIERT ES?","COME FUNZIONA?","КАК ЭТО РАБОТАЕТ?","如何运作？","仕組みは？","كيف يعمل؟"]]
    ,["Comparte tu enlace.",["Share your link.","Compartilhe seu link.","Partagez votre lien.","Teile deinen Link.","Condividi il tuo link.","Поделитесь ссылкой.","分享你的链接。","リンクを共有しましょう。","شارك رابطك."]]
    ,["Tu amigo realiza su primera compra.",["Your friend makes their first purchase.","Seu amigo faz a primeira compra.","Votre ami effectue son premier achat.","Dein Freund tätigt seinen ersten Kauf.","Il tuo amico effettua il primo acquisto.","Ваш друг совершает первую покупку.","好友完成首次购买。","友達が初めて購入します。","يجري صديقك أول عملية شراء."]]
    ,["Recibe tu 5%.",["Receive your 5%.","Receba seus 5%.","Recevez vos 5 %.","Erhalte deine 5 %.","Ricevi il tuo 5%.","Получите свои 5%.","获得你的 5%。","5%を受け取りましょう。","احصل على نسبة 5٪."]]
    ,["Cargando catálogo...",["Loading catalog...","Carregando catálogo...","Chargement du catalogue...","Katalog wird geladen...","Caricamento catalogo...","Загрузка каталога...","正在加载目录...","カタログを読み込み中...","جارٍ تحميل الكتالوج..."]]
    ,["Cargando productos...",["Loading products...","Carregando produtos...","Chargement des produits...","Produkte werden geladen...","Caricamento prodotti...","Загрузка товаров...","正在加载商品...","商品を読み込み中...","جارٍ تحميل المنتجات..."]]
    ,["No hay productos disponibles.",["No products available.","Não há produtos disponíveis.","Aucun produit disponible.","Keine Produkte verfügbar.","Nessun prodotto disponibile.","Нет доступных товаров.","暂无可用商品。","利用可能な商品はありません。","لا توجد منتجات متاحة."]]
    ,["Precio no disponible",["Price unavailable","Preço indisponível","Prix indisponible","Preis nicht verfügbar","Prezzo non disponibile","Цена недоступна","价格不可用","価格を利用できません","السعر غير متاح"]]
    ,["Nickname verificado",["Nickname verified","Nickname verificado","Pseudo vérifié","Nickname verifiziert","Nickname verificato","Никнейм подтвержден","昵称已验证","ニックネーム確認済み","تم التحقق من اسم المستخدم"]]
    ,["Verificando nickname...",["Verifying nickname...","Verificando nickname...","Vérification du pseudo...","Nickname wird überprüft...","Verifica del nickname...","Проверка никнейма...","正在验证昵称...","ニックネームを確認中...","جارٍ التحقق من اسم المستخدم..."]]
    ,["Selecciona la región para ver los productos disponibles",["Select a region to view available products","Selecione uma região para ver os produtos disponíveis","Sélectionnez une région pour voir les produits disponibles","Wähle eine Region, um verfügbare Produkte anzuzeigen","Seleziona una regione per vedere i prodotti disponibili","Выберите регион, чтобы увидеть доступные товары","选择地区以查看可用商品","利用可能な商品を表示する地域を選択してください","اختر منطقة لعرض المنتجات المتاحة"]]
    ,["No pudimos cargar las tarjetas Google Play. Comprueba tu conexión e inténtalo de nuevo.",["We couldn't load Google Play cards. Check your connection and try again.","Não foi possível carregar os cartões Google Play. Verifique sua conexão e tente novamente.","Impossible de charger les cartes Google Play. Vérifiez votre connexion et réessayez.","Google Play-Karten konnten nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.","Impossibile caricare le carte Google Play. Controlla la connessione e riprova.","Не удалось загрузить карты Google Play. Проверьте подключение и попробуйте снова.","无法加载 Google Play 卡。请检查网络连接后重试。","Google Playカードを読み込めませんでした。接続を確認して再試行してください。","تعذر تحميل بطاقات Google Play. تحقق من اتصالك وحاول مرة أخرى."]]
    ,["No pudimos cargar las tarjetas PlayStation. Comprueba tu conexión e inténtalo de nuevo.",["We couldn't load PlayStation cards. Check your connection and try again.","Não foi possível carregar os cartões PlayStation. Verifique sua conexão e tente novamente.","Impossible de charger les cartes PlayStation. Vérifiez votre connexion et réessayez.","PlayStation-Karten konnten nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.","Impossibile caricare le carte PlayStation. Controlla la connessione e riprova.","Не удалось загрузить карты PlayStation. Проверьте подключение и попробуйте снова.","无法加载 PlayStation 卡。请检查网络连接后重试。","PlayStationカードを読み込めませんでした。接続を確認して再試行してください。","تعذر تحميل بطاقات PlayStation. تحقق من اتصالك وحاول مرة أخرى."]]
    ,["No pudimos cargar las tarjetas Xbox. Comprueba tu conexión e inténtalo de nuevo.",["We couldn't load Xbox cards. Check your connection and try again.","Não foi possível carregar os cartões Xbox. Verifique sua conexão e tente novamente.","Impossible de charger les cartes Xbox. Vérifiez votre connexion et réessayez.","Xbox-Karten konnten nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.","Impossibile caricare le carte Xbox. Controlla la connessione e riprova.","Не удалось загрузить карты Xbox. Проверьте подключение и попробуйте снова.","无法加载 Xbox 卡。请检查网络连接后重试。","Xboxカードを読み込めませんでした。接続を確認して再試行してください。","تعذر تحميل بطاقات Xbox. تحقق من اتصالك وحاول مرة أخرى."]]
    ,["No pudimos cargar las tarjetas Nintendo. Comprueba tu conexión e inténtalo de nuevo.",["We couldn't load Nintendo cards. Check your connection and try again.","Não foi possível carregar os cartões Nintendo. Verifique sua conexão e tente novamente.","Impossible de charger les cartes Nintendo. Vérifiez votre connexion et réessayez.","Nintendo-Karten konnten nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.","Impossibile caricare le carte Nintendo. Controlla la connessione e riprova.","Не удалось загрузить карты Nintendo. Проверьте подключение и попробуйте снова.","无法加载 Nintendo 卡。请检查网络连接后重试。","Nintendoカードを読み込めませんでした。接続を確認して再試行してください。","تعذر تحميل بطاقات Nintendo. تحقق من اتصالك وحاول مرة أخرى."]]
    ,["No pudimos cargar las tarjetas Steam. Comprueba tu conexión e inténtalo de nuevo.",["We couldn't load Steam cards. Check your connection and try again.","Não foi possível carregar os cartões Steam. Verifique sua conexão e tente novamente.","Impossible de charger les cartes Steam. Vérifiez votre connexion et réessayez.","Steam-Karten konnten nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.","Impossibile caricare le carte Steam. Controlla la connessione e riprova.","Не удалось загрузить карты Steam. Проверьте подключение и попробуйте снова.","无法加载 Steam 卡。请检查网络连接后重试。","Steamカードを読み込めませんでした。接続を確認して再試行してください。","تعذر تحميل بطاقات Steam. تحقق من اتصالك وحاول مرة أخرى."]]
    ,["Canal de WhatsApp",["WhatsApp channel","Canal do WhatsApp","Canal WhatsApp","WhatsApp-Kanal","Canale WhatsApp","Канал WhatsApp","WhatsApp 频道","WhatsAppチャンネル","قناة واتساب"]]
    ,["Canal de Telegram",["Telegram channel","Canal do Telegram","Canal Telegram","Telegram-Kanal","Canale Telegram","Канал Telegram","Telegram 频道","Telegramチャンネル","قناة تيليجرام"]]
    ,["Explorar tienda ↗",["Explore store ↗","Explorar loja ↗","Explorer la boutique ↗","Shop entdecken ↗","Esplora il negozio ↗","Перейти в магазин ↗","浏览商店 ↗","ストアを見る ↗","استكشف المتجر ↗"]]
    ,["Tu próxima partida empieza aquí",["Your next match starts here","Sua próxima partida começa aqui","Votre prochaine partie commence ici","Dein nächstes Match beginnt hier","La tua prossima partita inizia qui","Твоя следующая игра начинается здесь","你的下一场对局从这里开始","次のゲームはここから始まる","مباراتك القادمة تبدأ من هنا"]]
    ,["Una plataforma pensada para que recargar sea tan sencillo como entrar a tu juego favorito.",["A platform designed to make topping up as easy as opening your favorite game.","Uma plataforma pensada para tornar a recarga tão simples quanto abrir seu jogo favorito.","Une plateforme conçue pour rendre la recharge aussi simple que de lancer votre jeu préféré.","Eine Plattform, auf der Aufladen so einfach ist wie das Öffnen deines Lieblingsspiels.","Una piattaforma pensata per rendere la ricarica semplice come aprire il tuo gioco preferito.","Платформа, где пополнение так же просто, как запуск любимой игры.","让充值像打开你最喜欢的游戏一样简单的平台。","お気に入りのゲームを開くのと同じくらい簡単にチャージできるプラットフォーム。","منصة تجعل الشحن سهلاً مثل فتح لعبتك المفضلة."]]
    ,["Una experiencia ágil",["A seamless experience","Uma experiência ágil","Une expérience fluide","Ein reibungsloses Erlebnis","Un’esperienza fluida","Удобный процесс","流畅体验","スムーズな体験","تجربة سلسة"]]
    ,["Diseñado para el mundo",["Designed for the world","Feito para o mundo","Conçu pour le monde","Für die Welt entwickelt","Progettato per il mondo","Создано для всего мира","为世界而设计","世界に向けて設計","مصمم للعالم"]]
    ,["Rápido, seguro y global",["Fast, secure and global","Rápido, seguro e global","Rapide, sécurisé et mondial","Schnell, sicher und global","Veloce, sicuro e globale","Быстро, безопасно и глобально","快速、安全、全球化","高速・安全・グローバル","سريع وآمن وعالمي"]]
    ,["POR QUÉ ELEGIRNOS",["WHY CHOOSE US","POR QUE NOS ESCOLHER","POURQUOI NOUS CHOISIR","WARUM WIR","PERCHÉ SCEGLIERCI","ПОЧЕМУ ВЫБИРАЮТ НАС","为什么选择我们","選ばれる理由","لماذا تختارنا"]]
    ,["ELIGE TU PARTIDA",["CHOOSE YOUR GAME","ESCOLHA SEU JOGO","CHOISISSEZ VOTRE JEU","WÄHLE DEIN SPIEL","SCEGLI IL TUO GIOCO","ВЫБЕРИ СВОЮ ИГРУ","选择你的游戏","ゲームを選択","اختر لعبتك"]]
    ,["RECARGA, JUEGA SIN LÍMITES",["TOP UP, PLAY WITHOUT LIMITS","RECARREGUE, JOGUE SEM LIMITES","RECHARGEZ, JOUEZ SANS LIMITES","AUFLADEN, SPIELEN OHNE GRENZEN","RICARICA, GIOCA SENZA LIMITI","ПОПОЛНЯЙ, ИГРАЙ БЕЗ ОГРАНИЧЕНИЙ","充值畅玩，无拘无束","チャージして、思いきりプレイ","اشحن والعب بلا حدود"]]
    ,["Tu plataforma global de recargas gaming.",["Your global gaming top-up platform.","Sua plataforma global de recargas para jogos.","Votre plateforme mondiale de recharge gaming.","Deine globale Plattform für Gaming-Aufladungen.","La tua piattaforma globale di ricariche gaming.","Глобальная платформа игровых пополнений.","全球游戏充值平台。","グローバルなゲームチャージプラットフォーム。","منصتك العالمية لشحن الألعاب."]]
  ];

  const DICTIONARIES = Object.fromEntries(LANGS.map(([code], index) => [
    code,
    Object.fromEntries(ROWS.map(([source, values]) => [source, index === 0 ? source : values[index - 1]]))
  ]));
  const translate = (value, lang) => {
    if (!value || lang === "es") return value;
    const dictionary = DICTIONARIES[lang];
    if (!dictionary) return value;
    const clean = value.trim().replace(/\s+/g," ");
    return dictionary[clean] || value;
  };
  const skip = "script,style,noscript,svg,code,pre,[contenteditable=true],[data-no-translate],.profile,.user-id,.balance,.avatar,.order-code,.player-id,.private-data";
  const skipAttributes = "script,style,noscript,svg,code,pre,[contenteditable=true],[data-no-translate],.profile,.user-id,.balance,.avatar,.order-code,.player-id,.private-data";
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
      ["placeholder","aria-label","title","value"].forEach(attr => {
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