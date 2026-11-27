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