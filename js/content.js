// Contenu par défaut du site. Le dashboard (admin.html) enregistre une version modifiée dans Supabase,
// qui prend le dessus sur ce fichier.
window.DEFAULT_CONTENT = {
  identite: {
    nom: "Nuance de Lait",
    sous_titre: "Reine du Clan de l'Ombre · La diva bienveillante des marais",
    citation: "Mon handicap ? Oh, c'est d'être né, sans aucun doute.",
    image: "assets/nuance.webp",
    pseudo_joueur: ".araxia.",
    credits: ".araxia.",
    lunes: "74 lunes",
    clan: "Clan de l'Ombre",
    rang: "Reine du clan — aide les félines gestantes et les mères ; vétéran respecté",
    sexe: "Mâle cisgenre",
    orientation: "Bisexuel",
    pv: 50,
    pa: 5,
    taille: "22 cm au garrot",
    poids: "2,3 kg",
  },

  noms: [
    { etape: "Chaton", nom: "Petit Lait", texte: "Ce nom lui fut attribué dès sa naissance par ses parents en raison de la pâleur laiteuse de sa robe. Bien que génétiquement crème, la blancheur immaculée de ses pattes et la clarté de sa peau nue lui donnaient une douceur visuelle unique, évoquant le lait fraîchement tiré." },
    { etape: "Apprenti", nom: "Nuage de Lait", texte: "" },
    { etape: "Adulte", nom: "Nuance de Lait", texte: "En lui accordant son nom d'adulte, Étoile du Crépuscule choisit d'honorer sa singularité physique. Le préfixe « Nuance » fut choisi parce que son pelage ne formait pas un bloc de couleur solide, mais un dégradé subtil : un fondu délicat entre le blanc pur de ses chaussettes, le crème mackerel de ses rayures et le rose tendre de sa peau fragile." },
    { etape: "Chef", nom: "Étoile de Lait", texte: "" },
    { etape: "Ancien", nom: "—", texte: "Le meneur choisira, si le nom doit changer." },
  ],

  caractere: {
    description: [
      "Nuance de Lait est un paradoxe ambulant, une créature de contrastes qui détonne magnifiquement sous la voûte sombre et brumeuse du Clan de l'Ombre. Du haut de ses 74 lunes, ce vétéran au physique singulier a troqué la brutalité des griffes contre l'art de la mise en scène et la force du mot juste. Il est la « diva bienveillante » du camp, un esthète qui refuse de laisser la ruine et l'anxiété ambiantes dicter sa conduite. Pour lui, la coquetterie n'est pas une simple futilité : c'est un acte de résistance, une manière d'imposer de la grâce là où la maladie et les tragédies du passé ont laissé des marques.",
      "Sous cette armure de vanité théâtrale se cache pourtant l'un des cœurs les plus profondément empathiques de la forêt. Élevé dans l'absence de jugement par ses défunts parents, il a fait de sa propre différence une passerelle vers les autres. Il est le refuge des éclopés, le confident des marginaux et l'oreille attentive des guerriers brisés par les dérives récentes du clan.",
      "Cependant, Nuance de Lait n'a rien d'un saint. C'est un vieux chat désabusé qui a perdu sa foi dans les illusions guerrières et le silence des ancêtres. Son cynisme est acéré, et si on l'agace ou qu'on attaque son physique, sa douceur feinte se fissure pour libérer un sarcasme mordant. Épicurien et profondément oisif, il utilise son charme et sa manipulation douce pour s'éviter le froid et la boue des corvées. En somme : une lueur crème et chaleureuse dans le brouillard du marais, fragile, paresseux et piquant, mais le roc psychologique dont son clan a désespérément besoin.",
    ],
    qualites: [
      { titre: "Empathique", texte: "Dépourvu de tout jugement et profondément à l'écoute des émotions d'autrui, c'est un confident hors pair. Parce qu'il a lui-même connu le poids des regards, son cœur bat pour les marginaux, les exclus et les âmes meurtries du clan." },
      { titre: "Résilient", texte: "Sa condition physique fragile lui a imposé une discipline de fer. Là où d'autres cèdent à la panique face à la crise, lui s'adapte avec un flegme déconcertant, emportant ses véritables douleurs dans un silence digne." },
      { titre: "Diplomate", texte: "Héritier spirituel de la sagesse de son père, il possède une patience infinie et une grande finesse psychologique. Il désamorce les conflits d'un mot d'esprit bien placé, sans verser une goutte de sang." },
      { titre: "Flegmatique", texte: "Rien ne semble pouvoir ébranler son calme olympien. Ayant survécu à la tyrannie, aux épidémies et à sa propre vulnérabilité, il contemple le danger avec un détachement souverain — un ancrage rassurant pour son entourage." },
    ],
    defauts: [
      { titre: "Superficiel", texte: "Obsédé par le détail et la coquetterie, il peut bouder des lunes pour des herbes aromatiques abîmées, faire une scène pour une ronce mal placée dans son nid, ou pester des heures contre une goutte de boue sur ses chaussettes blanches." },
      { titre: "Cynique", texte: "La dérive d'Étoile Douce et l'horreur des Dynastes ont émoussé sa foi en la « grandeur » des lois guerrières. Il douche l'enthousiasme des jeunes guerriers assoiffés de gloire par des remarques d'un réalisme sombre, quitte à passer pour un lâche." },
      { titre: "Oisif", texte: "Il a brillamment érigé la paresse au rang d'art de vivre. D'un sourire charmeur, d'un compliment bien tourné ou en dramatisant une simple irritation, il pousse apprentis naïfs et jeunes guerriers fiers à accomplir ses tâches à sa place." },
      { titre: "Sarcastique", texte: "Sa diplomatie s'arrête là où commencent la bêtise d'autrui ou les attaques sur son physique. Ses répliques, décochées avec un sourire poli et une voix doucereuse, blessent plus profondément que le plus aiguisé des coups de griffe." },
    ],
  },

  gouts: {
    aime: [
      { titre: "L'art du soin et de l'élégance", texte: "Un rituel de beauté, une peau apaisée et un parfum délicat de menthe ou de lavande sauvage : sa manière d'apporter de la splendeur dans la grisaille des marais." },
      { titre: "Conter le passé aux plus jeunes", texte: "Le prétexte idéal pour s'installer confortablement au milieu des apprentis et des chatons, loin du tumulte du camp et des corvées." },
      { titre: "Le confort des antres chaleureux", texte: "Blotti dans la pouponnière auprès des reines, ou en train de trier les remèdes dans l'antre d'Illusion du Puceron, toujours à l'abri et au chaud." },
      { titre: "Recueillir les confidences", texte: "Être le confident secret et le guide spirituel du clan est une véritable vocation : se rendre utile en guérissant les esprits flatte autant son ego que son empathie." },
    ],
    deteste: [
      { titre: "La saleté et le désordre", texte: "Boue collante des marais, poussière, humidité crasseuse de la brume : rien ne doit ternir son pelage ni irriter sa peau." },
      { titre: "Le surmenage et les ordres", texte: "Entendre « Nuance de Lait, fais ci ! » lui hérisse le peu de poils qu'il possède. Son temps est bien trop précieux pour un labeur sans grâce." },
      { titre: "Les saisons extrêmes", texte: "Le soleil de plomb de la Saison des Feuilles Vertes brûle sa peau nue ; le froid polaire de la Mauvaise Saison menace son système immunitaire. Seuls le renouveau et les feuilles mortes trouvent grâce à ses yeux." },
      { titre: "Jouer les arbitres", texte: "Il refuse de désigner un vainqueur ou de distribuer des torts : il est là pour apaiser les tensions, pas pour juger." },
    ],
    peurs: [
      { titre: "L'astre brûlant", texte: "Aussi surprenant que cela soit pour un chat de l'Ombre, il craint le soleil : sa lumière éblouissante et surtout ses rayons cuisants sur sa peau dénudée." },
      { titre: "Le spectre de la bête de foire", texte: "Marqué par les moqueries de sa jeunesse et les superstitions des anciens, il craint viscéralement d'être jugé, ou que son apparence de « chat-loup » soit assimilée à celle d'une créature repoussante ou éternellement malade." },
      { titre: "La contagion", texte: "Dès qu'un cas de Mal Blanc ou de Mal Vert est déclaré, il s'évanouit dans la nature et refuse de s'approcher à moins de dix pas d'un félin fiévreux — préférant passer pour un lâche plutôt que risquer sa vie." },
    ],
    habitudes: [
      { titre: "La routine « skincare » des marais", texte: "Bave d'escargot pour hydrater, boue fraîche et stérile pour apaiser les démangeaisons, argile contre l'humidité, menthe aquatique ou aiguilles de pin pour le parfum." },
      { titre: "L'allure royale et aérienne", texte: "La tête haute, une démarche légère et chaloupée : il glisse entre les racines comme s'il survolait la boue, transformant sa fragilité en élégance aristocratique." },
      { titre: "Le limage minutieux des griffes", texte: "Ses griffes, anormalement longues, peinent à se rétracter. Il les lime sur les écorces les plus tendres et évite les rochers, dont la sensation le fait frissonner." },
    ],
  },

  physique: {
    description: [
      "Nuance de Lait est un félin de petite taille, culminant à peine à 22 cm au garrot pour un poids plume de 2,3 kg. Cette silhouette d'une finesse extrême, longiligne et flexible comme une couleuvre, est taillée pour la traque, l'espionnage et l'infiltration dans les recoins les plus étroits des marais.",
      "Totalement dépourvu de sous-poil à cause de son anomalie génétique, le peu de fourrure qu'il possède sur le dos est épais, court et rêche. Sa robe arbore une teinte crème chaleureuse balayée d'un motif mackerel tabby, qui vient buter contre le blanc immaculé de ses quatre pattes, de parfaites petites chaussettes.",
      "Au centre de son visage partiellement dénudé trônent deux grands yeux ronds d'un vert forêt profond et magnétique, rehaussés de longs cils. De fines rides d'expression et des cernes violacés soulignent ses paupières, témoins des nuits blanches passées à veiller sur le clan.",
      "Il possède une voix mielleuse, d'une douceur traînante et affectée, portée par un timbre étonnamment grave, chaud et posé : une voix de conteur et de diplomate qui force l'écoute sans jamais crier.",
      "Il est rare de croiser Nuance de Lait sans un artifice. Sa peau est régulièrement badigeonnée d'onguents naturels, et on le surprend souvent à la lisière du camp, une coquille de moule nacrée entre les pattes, inspectant son reflet opalin.",
    ],
    forts: [
      { titre: "Une souplesse de couleuvre", texte: "Un corps d'une élasticité surprenante, capable de se faufiler dans les recoins les plus inaccessibles. Le cauchemar des chatons farceurs : aucune cachette ne lui échappe." },
      { titre: "Des griffes dagues", texte: "Sous ses manières délicates, il dissimule des griffes anormalement longues et acérées — redoutables si on l'agace un jour où sa manucure a été négligée." },
      { titre: "Une discrétion insoupçonnée", texte: "Quand il le décide, il fait taire le moindre de ses pas et fond sa silhouette claire dans les ombres de la pinède avec une aisance de fantôme." },
      { titre: "Des réflexes d'élite", texte: "Incapable de miser sur la puissance, il compense par une vivacité d'esprit et de corps qui le rend excellent en chasse et en traque, et aborde le combat de façon stratégique et intuitive." },
    ],
    faibles: [
      { titre: "Un système immunitaire en carton", texte: "À cause du gène Lykoï, la moindre brise printanière peut lui déclencher un rhume carabiné, et la moindre égratignure s'infecte en une lune sans baume protecteur." },
      { titre: "Aucune force brute", texte: "Il n'est absolument pas taillé pour bloquer une charge ou terrasser un adversaire. Face à un ennemi massif, la confrontation directe lui est interdite." },
      { titre: "Résistance nulle", texte: "Coups, froid, rigueur du climat des marais : son corps n'oppose aucune résistance, faisant de lui l'un des guerriers les plus vulnérables du camp." },
      { titre: "Une respiration sifflante", texte: "Dès qu'il pousse trop ses efforts, ses poumons le trahissent. Un handicap qu'il utilise d'ailleurs comme excuse pour se déclarer « parfaitement inapte au labeur »." },
    ],
    handicap: {
      citation: "Mon handicap ? Oh, c'est d'être né, sans aucun doute.",
      intro: "Si l'on met de côté son sens de la formule, le destin n'a pas épargné Nuance de Lait. Marqué par le gène récessif du Lykoï, son apparence atypique cache des réalités physiques éprouvantes :",
      points: [
        "Un système immunitaire dramatiquement déficient, qui fait de lui un habitué de l'antre médical, à tenir compagnie au guérisseur Illusion du Puceron.",
        "Sans sous-poil protecteur, sa peau est d'une fragilité extrême : le gel la crevasse, le soleil l'inflige de douloureuses brûlures, la moindre égratignure d'ajonc prend des proportions alarmantes.",
        "À 74 lunes, un vieillissement prématuré a fait apparaître une respiration sifflante et laborieuse, le rendant inapte aux longues traques.",
      ],
    },
    accessoires: {
      citation: "Un chat coquet dépourvu d'ornements ? Allons, est-ce là l'idée que vous vous faites d'un félin raffiné ?!",
      points: [
        { titre: "Le brin de menthe aquatique", texte: "Toujours calé derrière son oreille droite, il diffuse un parfum frais qui masque l'odeur de vase qu'il exècre." },
        { titre: "Le plastron de plumes", texte: "Il tresse des plumes de geais, corbeaux, choucas, rouges-gorges, hérons ou chouettes avec des tiges de jonc pour s'en faire un collier qui protège son poitrail dénudé des courants d'air." },
        { titre: "La seconde peau", texte: "Par grand soleil, il recouvre ses zones nues de mues de serpent soigneusement nettoyées. Ses camarades trouvent cela écœurant ; lui y voit la plus avant-gardiste des protections solaires." },
      ],
    },
    cicatrices: [
      "Une longue cicatrice balafre son dos : le pelage n'y a jamais repoussé, laissant une ligne de peau rose au milieu de ses rayures crème. Une marque héritée de son apprentissage, lors d'un entraînement où son adversaire, un peu trop zélé, n'avait pas retenu ses griffes face à un apprenti si fragile.",
    ],
  },

  relations: {
    famille: [
      { nom: "Sérénité de Clématite", lien: "Père", statut: "PNJ · Mort", texte: "Le modèle absolu de Nuance de Lait : un guerrier respecté, apprécié de tous et d'une sagesse légendaire. Il regrette amèrement de ne pas avoir partagé plus de saisons à ses côtés." },
      { nom: "Pic Rocheux", lien: "Mère", statut: "PNJ · Morte", texte: "Son tempérament de feu était à l'opposé du flegme de son fils, mais il l'aimait éperdument. Son décès a laissé un vide immense." },
      { nom: "Brume de Sureau", lien: "Sœur", statut: "PNJ · Vivante", texte: "Sa confidente, sa moitié. Elle partage sa condition génétique de « chat-loup ». Après avoir été sa mère porteuse par amour fraternel, elle a rejoint les anciens ; ils passent leurs journées à réinventer le monde." },
      { nom: "Pas de Furet", lien: "Sœur", statut: "PNJ · Morte", texte: "Son autre sœur de portée. Moins fusionnels, mais sa mort prématurée fut un véritable traumatisme." },
      { nom: "Cœur de Girolle", lien: "Sœur", statut: "PNJ · Vivante", texte: "Issue de la seconde portée de leurs parents, son éternel rayon de soleil, qu'il aime d'un amour protecteur et couvant." },
      { nom: "Griffe de Corpin", lien: "Sœur", statut: "PJ · @/celouest0638_79062 · Vivante", texte: "Au caractère plus affirmé. Lait et elle ont un peu de mal à s'entendre, mais ils s'apprécient quand même." },
      { nom: "Petite Morille", lien: "Frère", statut: "PNJ · Mort", texte: "Frère jumeau de Cœur de Girolle, tristement mort-né." },
    ],
    conjoints: [
      { nom: "Fierté de Ronce", lien: "Ex-compagnon", statut: "PNJ · Mort", texte: "L'antithèse de Nuance : grand guerrier sombre, robuste, ambitieux et débordant d'ego. Leur amour passionné s'est brisé dans les larmes et les reproches. Il a succombé il y a 4 lunes à une infection après l'affrontement contre les Dynastes." },
      { nom: "Truffe Champêtre", lien: "Ex-flirt · amie d'enfance", statut: "PJ · L0ops · Vivante", texte: "Splendide féline bicolore au pelage noir mi-long. Amis inséparables, ils ont cherché un réconfort dans les bras l'un de l'autre lors d'une période sombre. Aujourd'hui meneuse du Clan de l'Ombre, elle reste l'un des piliers secrets de sa vie." },
    ],
    descendance: [
      { nom: "Grognement de l'Ours", lien: "Fille", statut: "PJ · Sayori · Vivante", texte: "Sa douce, sa fierté. Elle a hérité du gène Lykoï, cette condition de « bête de foire » qu'ils portent comme une couronne. Son pelage écaille de tortue diluée la rend troublante de ressemblance avec Brume de Sureau." },
      { nom: "Tige de Roseau", lien: "Fils", statut: "PNJ · Mort", texte: "Un guerrier souple, altier et fier, tombé au combat lors d'une escarmouche sanglante il y a 15 lunes." },
      { nom: "Nuage de Brume", lien: "Fils", statut: "PNJ · Mort", texte: "Petit mâle gris laiteux, dont la santé de cristal n'a pas résisté à une mauvaise saison cruelle." },
      { nom: "Patte de Ruisseau", lien: "Fille", statut: "PJ · Orfraie · Morte", texte: "Née de son aventure secrète avec Truffe Champêtre, abandonnée à la frontière du Tonnerre pour lui épargner la brume toxique. Elle y est morte." },
      { nom: "Petit Mille-Pattes", lien: "Fils", statut: "PJ · @/pingouin3007 · Vivant", texte: "Son fils secret, déposé à la frontière du Tonnerre. Il grandit de l'autre côté des arbres, ignorant peut-être tout de ses origines." },
      { nom: "Petite Sauterelle", lien: "Fille", statut: "PJ · @/celouest0638_79062 · Vivante", texte: "Sa fille secrète, déposée elle aussi à la frontière du Clan du Tonnerre, aux côtés de sa sœur et de son frère." },
      { nom: "Petit Merisier", lien: "Fils", statut: "PNJ · Mort", texte: "Un petit chaton noir et blanc, mort à sa naissance." },
    ],
    mentorat: [
      { nom: "Cœur de Mousse", lien: "Son mentor", statut: "PNJ · Mort", texte: "Toujours doux et compréhensif. L'apprentissage, prévu pour six lunes, en dura huit afin que Nuance de Lait apprenne tout parfaitement." },
      { nom: "Chant de Grenouille", lien: "Sa première apprentie", statut: "PNJ · Vivante", texte: "Il a adoré l'entraîner : ce furent les lunes les plus amusantes qu'il ait passées." },
    ],
  },

  histoire: [
    "Dès ses premiers pas dans la pouponnière, le destin de Nuance de Lait s'est dessiné sous le signe de la fragilité. Marqué par un physique que beaucoup considéraient comme une malédiction, le petit chat a grandi au rythme des regards en coin, des messes basses et des superstitions des anciens. Sa santé de cristal l'a contraint à faire de l'antre médical sa seconde maison, où défilèrent ses guérisseurs : le vieux Queue de Serpent, oncle bienveillant ; la jeune Brume de Grêle, longtemps perçue comme une petite sœur avant que sa liaison interdite et sa trahison ne la fassent déchoir ; et aujourd'hui le jeune Illusion du Puceron.",
    "Au milieu de cette enfance solitaire, une lueur a tout changé : sa rencontre avec Truffe Champêtre. Devenus inséparables, elle fut son ancre, la seule à ne jamais juger sa peau nue.",
    "Vers 18 lunes, son cœur s'est éveillé au contact de Fierté de Ronce, guerrier robuste et ambitieux qui lui offrait enfin de la reconnaissance. Désireux de fonder une famille, le couple a essuyé le refus de Pas de Furet pour porter leurs enfants, et s'est tourné vers sa sœur jumelle, Brume de Sureau.",
    "Mais le conte de fées s'est brisé le jour de la mise bas. En découvrant que l'unique femelle de la portée avait hérité du gène Lykoï, l'orgueil de Fierté de Ronce a basculé dans l'eugénisme : il a cruellement ignoré la petite, reportant ses espoirs sur ses deux fils. Pendant des lunes, Nuance a tout enduré : reproches amers, insultes voilées et le spectacle d'un père rejetant son propre sang.",
    "Poussé à bout, il a trouvé la force de briser ses chaînes. Blessé dans son ego, Fierté de Ronce a explosé dans une rage noire, et la séparation s'est muée en un affrontement d'une violence inouïe. Les blessures ont guéri ; la cicatrice psychologique, jamais, le dégoûtant à jamais de la brutalité guerrière.",
    "À l'approche de ses 65 lunes, las des patrouilles et d'un corps qui le trahissait, il a déposé les armes pour devenir reine. Dans la douceur de la pouponnière, il a trouvé sa véritable vocation. C'est de là qu'il a assisté, horrifié, au massacre des Dynastes provoqué par la folie d'Étoile Douce, réconfortant les guerriers revenus du front, l'esprit brisé par la culpabilité.",
    "La mort de Fierté de Ronce, des suites de blessures infectées, a clos ce chapitre. Cherchant du réconfort dans un clan en déchéance, Nuance s'est tourné vers Truffe Champêtre. De leur étreinte éphémère est née une portée de deux chatons.",
    "Mais le territoire de l'Ombre était devenu un enfer toxique, rongé par une brume maléfique envoyée par les Étoiles. Devenue meneuse, Truffe Champêtre a dû faire un choix aussi déchirant que nécessaire : Nuance a regardé, le cœur en miettes, sa meilleure amie emporter leurs deux petits ainsi que la portée de Brume de Grêle pour les abandonner à la frontière du Clan du Tonnerre. Un sacrifice ultime pour leur offrir une chance de grandir sous un ciel plus clément.",
    "Aujourd'hui, à 74 lunes, c'est ce passé riche de larmes et de secrets qui dicte chacun de ses pas, faisant de lui la reine la plus digne, la plus protectrice et la plus résolue de la forêt.",
  ],

  convictions: {
    clan: {
      citation: "Ma relation avec le clan ? Oh, par les Étoiles, c'est d'un complexe... Ne m'en parlez pas, cela me donne des migraines.",
      paragraphes: [
        "Une partie de lui nourrit un vif ressentiment envers sa propre lignée. Être traité en bête de foire, essuyer les quolibets au sein même de cette « grande famille » a été un fardeau insoutenable. Très rancunier, il garde une dent contre les esprits les plus étroits et superstitieux du camp.",
        "En contrepartie, il adore viscéralement son clan : son foyer, une famille géante qu'il est incapable de haïr. Pour eux, et pour la pouponnière, il serait prêt à donner sa dernière lune de vie.",
        "Depuis le massacre des solitaires, il éprouve un profond dégoût pour la cruauté gratuite et évite ceux qui ont participé de bon cœur à cette boucherie. Quant aux survivants du clan déchu qui ont trouvé refuge chez eux, il les observe d'un œil noir : pour lui, le Clan des Étoiles a été clair en foudroyant le Grand Chêne, et ces exilés ont apporté leur malédiction dans leurs bagages.",
      ],
    },
    autres_clans: {
      intro: "Les autres clans ? Nuance de Lait vous rira au nez, ou vous crachera ses quatre vérités en affirmant que ce ne sont que des ramassis de pourriture. Il concède simplement, par logique théologique, qu'il faut bien trois clans pour maintenir l'équilibre de la forêt.",
      clans: [
        { nom: "Clan du Tonnerre", texte: "Sous Étoile Brumeuse, il les exécrait : trop enclins à la guerre, d'une rigidité glaciale et d'un orgueil insupportable. Depuis que les Étoiles ont choisi un jeune guerrier au profil pacifique, il observe de loin, sceptique, attendant de voir si cette douceur n'est pas un écran de fumée." },
        { nom: "Clan du Vent", texte: "Une source de perplexité entre la mort mystérieuse d'Étoile Blanche et les choix étranges des ancêtres. Il oscillait entre fascination et respect sincère pour Éclat de Scarabée — jusqu'à la liaison interdite entre Brume de Grêle et Étoile de Griffe, qui lui a laissé un goût de cendre et une profonde rancœur. Il glane désormais les rumeurs sur Étoile d'Ocre et Chant de Cigale." },
        { nom: "Clan de la Rivière", texte: "Une succession de tragédies provoquées par des dirigeants tyranniques : une terre maudite que le Clan des Étoiles a lui-même décrété détruire. Il éprouve une pointe de pitié théâtrale, mais sa méfiance envers les survivants reste absolue." },
      ],
    },
    etoiles: {
      citation: "Les Étoiles ne commettent jamais d'erreur. Si le ciel gronde, c'est que nos actes ont manqué de droiture. C'est aussi simple que cela.",
      paragraphes: [
        "Pieux dans l'âme, Nuance de Lait voue un culte absolu au Clan des Étoiles : la parole des ancêtres est sacrée et d'une logique divine qu'aucun mortel ne devrait surseoir.",
        "Aux nouvelles lunes, quand le ciel se drape d'obscurité, il s'astreint à de longues veillées de prière sous la Toison Argentée, murmurant des louanges aux défunts.",
        "Malgré la malédiction et la brume toxique qui frappent l'Ombre, il ne ressent aucune amertume : il juge cette punition parfaitement juste. Le massacre des Dynastes était une abomination. Il prie pour la rédemption de son clan, l'équilibre des autres et le salut de ceux qu'il aime.",
        "Quand le clan peut se permettre de « perdre » quelques ressources, il dépose de petites offrandes aux frontières ou sur les hauts rochers — une plume rare, une fleur de menthe intacte, une proie charnue — pour honorer la mémoire de Sérénité de Clématite et Pic Rocheux.",
      ],
    },
  },
};
