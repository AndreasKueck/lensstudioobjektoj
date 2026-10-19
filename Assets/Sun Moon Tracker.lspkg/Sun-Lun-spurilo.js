//@component
/*
    Trovu objektojn
    Tracker für die drei nächstgelegenen Zamenhof-/Esperanto-Objekte, ZEO.

    Neue Version:
    - KEINE RawLocationModule-Verwendung mehr
    - KEINE GeoLocation.createLocationService()
    - KEINE direkte GPS-Position des Nutzers
    - Quasi-Standort = Zentroid des nächstgelegenen Snapchat Place
    - Objekt-Namen werden anonymisiert: ZEO 1, ZEO 2, ZEO 3
    - Entfernungen ganzzahlig in km, Minimum 1 km
    - Richtungen als Esperanto-Himmelsrichtungen:
      norde, nord-oriente, oriente, sud-oriente,
      sude, sud-okcidente, okcidente, nord-okcidente
*/

// UI
//@ui {"widget":"label"}
//@ui {"widget":"separator"}
//@ui {"widget":"label", "label":"<big><b>Trovu objektojn</b>"}
//@ui {"widget":"label", "label":"Findet die drei nächstgelegenen ZEO."}
//@ui {"widget":"label", "label":"Nutzt Snapchat Places API statt Raw Location."}
//@ui {"widget":"separator"}

//@input Component.DeviceTracking deviceTracking
//@input Asset.RemoteServiceModule remoteServiceModule

const PlacesModule = require("./SnapchatPlacesAPIAPIModule");
var placesApi = script.remoteServiceModule
    ? new PlacesModule.ApiModule(script.remoteServiceModule)
    : null;

/*
    HIER DEINEN KOMPLETTEN VORHANDENEN CSV-BLOCK EINSETZEN.

    Also den Inhalt aus deinem bisherigen Script:

    const ZEO_CSV = `
    Name,Breitengrad,Laengengrad
    Allée Zamenhof,43.66748,7.18556
    ...
    `.trim();

    Der Block selbst muss nicht geändert werden.
*/
const ZEO_CSV = `
Name,Breitengrad,Laengengrad
Allée Zamenhof,43.66748,7.18556
Allée de l'Espéranto,48.91558,2.48451
Allée du Docteur-Lejzer-Ludwik-Zamenhof,43.58527,1.37704
"Avenue Dr Zamenhof, Anderlecht",50.82859,4.3073
Avenue du Docteur Zamenhof,45.79593,4.85252
Bona Espero,-14.13361,-47.61806
Deutsche Esperanto-Bibliothek,48.837,10.092
"Doktor-Zamenhof-Straße, Frohburg",51.05597,12.55549
Doutor Luiz Lázaro Zamenhof,-23.54334,-46.64205
"Dr Zamenhofstraat, Schiedam",51.9198,4.4157
"Dr. L.L. Zamenhoflaan, Dordrecht",51.8129,4.6869
"Dr. Zamenhoflaan, Enschede",52.2394,6.8756
"Dr. Zamenhofstraat, Rotterdam",51.9246,4.5019
"Dr.-Ludwig-Zamenhof-Straße, Pfaffenhofen an der Ilm",48.53204,11.51523
Dr.-Zamenhof-Straße,48.38045,10.84583
Dr.-Zamenhof-Straße,51.05649,12.55522
Dr.-Zamenhof-Straße,51.2655,12.50651
"Dr.-Zamenhof-Straße, Augsburg",48.38047,10.84582
Esperanto,59.34361,18.06556
Esperanto Kongress- und Kulturzentrum Fulda,50.55678,9.68611
"Esperanto Road, Auckland",-36.9778,174.87867
Esperanto-Denkmal,48.29102,14.29062
Esperanto-Haus Michendorf,52.30015,13.04021
Esperanto-Insel,-62.42861,-60.17306
Esperanto-Stacio,52.10925,13.70143
Esperanto-Strasse,43.53118,-5.64975
"Esperantolaan, Arnhem",51.9901,5.944
"Esperantolaan, Muntendam",53.137,6.8695
"Esperantolaan, Stadskanaal",52.9913,6.9473
Esperantomuseum der Österreichischen Nationalbibliothek,48.2093,16.3653
Esperantopark,47.81409,16.23822
Esperantopark und Girardipark,48.2008,16.3673
"Esperantoplatsen, Göteborg",57.70269,11.95561
Esperantoplatz,52.47289,13.45283
Esperantoplatz,48.13015,11.55358
"Esperantoplein, Den Haag",52.0754,4.2925
"Esperantoplein, Ransdaal",50.864,5.8864
Esperantostraat,53.20856,6.57798
"Esperantostraat, Den Haag",52.0745,4.2923
"Esperantostraat, Rheden",52.0068,6.0283
Esperantostraße,50.0906,8.68352
Esperantostraße,49.47391,11.12553
Esperantostraße,50.88421,6.59819
"Esperantostraße, Oberkirch",48.53702,8.0684
"Esperantostraße, Stuttgart",48.76924,9.13996
"Esperantostraße, Weiden",49.66696,12.14669
Esperantoweg,51.28559,7.30171
"Esperantoweg, Romanshorn",47.56037,9.37115
"Esperantoweg, Unterkirnach",48.07713,8.36318
Herzberg am Harz,51.65556,10.33944
Impasse Docteur-Zamenhof,47.30523,5.05738
Impasse Docteur-Zamenhof,43.12604,6.14364
Impasse Zamenhof,43.35476,5.33885
Insel Esperanto,43.71722,24.04194
Ludwig Zamenhof-Denkmal,48.20077,16.36716
"Ludwig-Zamenhof-Straße, Hattingen",51.40832,7.20022
Ludwig-Zamenhof-Weg,50.08984,8.68299
"Ludwika Zamenhofa, Zamość",50.7181,23.2544
Q135216949,50.27847,2.77829
Q135216967,42.77055,2.87536
Q135217003,49.90578,2.29126
Q135240553,42.87728,2.18024
Q135487947,44.99374,-0.44463
Rue Docteur-Zamenhof,47.20407,-1.53568
Rue Docteur-Zamenhof,43.35945,5.32317
"Rue Dr. Zamenhof, Antananarivo",-18.90232,47.52695
Rue Gaston Waringhien,48.06767,0.1209
Rue Zamenhof,49.41133,1.0903
Rue du Docteur Zamenhof,44.11926,4.0969
Rue du Docteur Zamenhof,45.86095,3.54915
Rue du Docteur Zamenhof,43.41976,6.77125
Rue du Docteur-Ludwig Lazarus Zamenhof,42.69697,2.89069
Rue du Docteur-Zamenhof,48.72896,2.4507
Rue du Docteur-Zamenhof,48.87899,2.18316
Rue du Docteur-Zamenhoff,48.81496,2.26727
SOJO,35.70827,139.72342
Schloss Grésillon,47.55129,-0.08231
Ulica Ludwika Zamenhofa,52.388,16.9463
Ulica Ludwika Zamenhofa,52.2493,20.9951
Weinmarkt 14,49.45553,11.07403
Zamenhof,52.5123,4.6713
"Zamenhof, Arnsberg",51.45794,7.94447
"Zamenhof-Denkmal, Wiener Neustadt",47.8137,16.23788
Zamenhof-Eiche,52.4729,13.45289
Zamenhofdenkmal beim Bahnhof in Wörgl,47.49111,12.0616
"Zamenhofdreef, Utrecht",52.1141,5.1123
"Zamenhoflaan, Lopik",51.9748,4.959
"Zamenhoflaan, Zeist",52.1018,5.2236
Zamenhofpark,52.5094,13.5036
Zamenhofstraat,52.3881,4.9263
Zamenhofstraat,53.1848,7.208
"Zamenhofstraat, Den Haag",52.0787,4.2956
"Zamenhofstraat, Haarlem",52.3579,4.6656
"Zamenhofstraat, Leiden",52.1641,4.4908
"Zamenhofstraat, Roden",53.1348,6.4253
"Zamenhofstraat, Zaanstad",52.4989,4.7588
Zamenhofstraße,51.01104,13.81947
Zamenhofstraße,51.28127,7.16644
Zamenhofstraße,50.96893,6.89874
"Zamenhofstraße, Bremen",53.12498,8.74961
"Zamenhofstraße, Gross-Gerau",49.91981,8.4917
"Zamenhofstraße, Karlsruhe",49.01306,8.43668
"Zamenhofstraße, Linz",48.28873,14.31476
"Zamenhofstraße, Mannheim",49.51671,8.50842
"Zamenhofstraße, Nordhorn",52.41589,7.06705
"Zamenhofstraße, Oelsnitz",50.73533,12.71449
"Zamenhofstraße, Rüsselsheim",49.98012,8.41658
"Zamenhofstraße, Stuttgart",48.77006,9.13904
Zamenhofweg,51.28661,7.30038
Zamenhofweg,47.68922,11.75223
Zamenhofweg,51.2206,6.84553
"Zamenhofweg, Hamburg",53.6226,10.13195
impasse de l'Espéranto,43.83883,5.05184
Allée de l'Espéranto,48.91558,2.48451
Antoni Grabowski Street,53.14819,23.07146
Avenue Docteur Zamenhof - Dokter Zamenhoflaan,50.82859,4.3073
Biblioteca Ramón Molera,41.81159,2.09836
Bona Espero,-14.13361,-47.61806
Božidar Vančik Street,46.31079,16.34892
Bust Ludwik Zamenhof of Białystok,53.1335,23.1571
Bust of L. L. Zamenhof,-12.97872,-38.51428
Bust of Ludwik Zamenhof,-3.74329,-38.53786
Bust of Ludwik Zamenhof in Boulogne-sur-Mer,50.72723,1.60891
Bust of Zamenhof,46.48306,30.74417
"Calle Doctor Zamenhof, Zaragoza",41.65243,-0.9292
Calle Esperanto,28.48812,-16.31993
Calle del Doctor Zamenhof,39.49599,-0.68673
"Carrer del Doctor Zamenhof, Vilanova i la Geltrú",41.22473,1.70851
Castle Grésillon,47.55129,-0.08231
D-r Ludvig Zamenhof,42.70433,23.37085
Department of Planned Languages and Esperanto Museum,48.2093,16.3653
"Doctor Ludwik Zamenhof street, Varna",43.19997,27.91235
"Doctor Ludwik Zamenhof street, Varna",43.20339,27.91295
Doutor Luiz Lázaro Zamenhof,-23.54334,-46.64205
"Dr Zamenhofstraat, Schiedam",51.9198,4.4157
"Dr. L.L. Zamenhoflaan, Dordrecht",51.8129,4.6869
"Dr. Zamenhoflaan, Enschede",52.2394,6.8756
"Dr. Zamenhofstraat, Rotterdam",51.9246,4.5019
"Dr.-Ludwig-Zamenhof-Straße, Pfaffenhofen an der Ilm",48.53204,11.51523
Dr.-Zamenhof-Straße,48.38045,10.84583
Dr.-Zamenhof-Straße,51.05649,12.55522
Dr.-Zamenhof-Straße,51.2655,12.50651
"Dr.-Zamenhof-Straße, Augsburg",48.38047,10.84582
Esperantists' oak in Sopot,54.43028,18.54361
Esperanto,59.34361,18.06556
Esperanto Bridge,53.12087,18.02317
Esperanto Drive,29.49495,-81.22847
Esperanto Drive,30.45898,-87.28458
Esperanto House,52.94299,-2.16374
Esperanto House Michendorf,52.30015,13.04021
Esperanto Island,-62.42861,-60.17306
Esperanto Museum in Svitavy,49.75469,16.47261
Esperanto Place,53.38234,-1.46514
Esperanto Road,-36.9778,174.87867
Esperanto Street,54.74766,23.50212
Esperanto Street,55.55706,12.99496
Esperanto Street,-36.55627,145.95915
Esperanto Street,-27.22615,153.10274
Esperanto Street,43.53118,-5.64975
Esperanto Street,56.5155,21.0175
"Esperanto Street, Las Vegas",36.19018,-115.21408
Esperanto Way,54.57503,-2.47215
Esperanto Way,51.57081,-2.98134
Esperanto Way,53.04648,-2.17331
Esperanto Way,-31.86679,115.85254
Esperanto house,-33.89158,151.19749
Esperanto island,43.71722,24.04194
Esperanto memorial,48.29102,14.29062
Esperanto-Domo,51.98995,5.94557
Esperanto-Domo,34.99743,135.75428
Esperanto-Stacio,52.10925,13.70143
"Esperanto-house, Antwerp",51.21352,4.41041
"Esperantolaan, Arnhem",51.9901,5.944
"Esperantolaan, Muntendam",53.137,6.8695
"Esperantolaan, Stadskanaal",52.9913,6.9473
Esperantomonument,53.05639,4.79503
Esperantomonument,52.11061,5.11144
Esperantoneset,78.62325,15.39712
Esperantopark,47.81409,16.23822
Esperantoplatsen,57.70269,11.95561
"Esperantoplatz, Berlin",52.47289,13.45283
"Esperantoplatz, Munich",48.13015,11.55358
"Esperantoplein, Den Haag",52.0754,4.2925
"Esperantoplein, Ransdaal",50.864,5.8864
Esperantostraat,53.20856,6.57798
"Esperantostraat, Den Haag",52.0745,4.2923
"Esperantostraat, Rheden",52.0068,6.0283
Esperantostraße,50.0906,8.68352
Esperantostraße,49.47391,11.12553
Esperantostraße,50.88421,6.59819
Esperantoweg,51.28559,7.30171
Esperantoweg,47.56037,9.37115
Esperantska Street,45.55983,18.71857
Esperantystów Street,53.14917,23.07088
"Eszperantó Park, Pécs",46.07903,18.22799
German Esperanto Library,48.837,10.092
Grabowskiego Street in Warsaw,52.227,21.01578
Herzberg am Harz,51.65556,10.33944
Hotel Esperanto,53.13082,23.15948
Hotel Esperanto,50.85475,16.49661
"House number 10, Hybe",49.0454,19.83146
Impasse de l'Espéranto,43.83883,5.05184
Jakub Szapiro Street,53.15637,23.21801
L. Zamenhof Street,35.89797,14.48492
L. Zamenhofo g.,54.89541,23.89264
L.L. Zamenhof Monument,35.89574,14.49331
Liberecon por la Mondo,53.13853,23.12661
Ludwig-Zamenhof-Weg,50.08984,8.68299
"Ludwik Zamenhof bust, Curitiba",-25.42029,-49.26192
Ludwika Zamenhofa Street,52.388,16.9463
Ludwika Zamenhofa Street,52.2493,20.9951
"Ludwika Zamenhofa, Zamość",50.7181,23.2544
Marinko Gjivoje Street,42.96043,17.13336
Mavre Špicer Street,45.49394,18.11065
Museo de Esperanto de Subirats,41.3833,1.79411
"Nacia Esperanto-Muzeo, Gray",47.4431,5.59138
National Esperanto Library and Archive,44.03657,10.14094
"One God, One World, One Language",35.01235,135.58239
Parc Albert-Saint-Martin,45.51221,-73.59299
Parc de l'Espéranto,46.36446,-72.57912
Piazzale Esperanto,44.06992,12.45456
Plac Ludwika Zamenhofa,51.0875,17.03815
Plaque to Leopold Einstein,49.45551,11.07394
Rua Klara Zilbernick,-23.01957,-43.46185
Rua Zamenhof,-22.91693,-43.20726
Rue Docteur-Zamenhof,43.35945,5.32317
Rue Dr. Zamenhof,-18.90232,47.52695
Rue de l'Espéranto,46.36414,-72.57943
Rue du Docteur Ludwig Lazarus Zamenhof,42.69697,2.89069
SOJO,35.70827,139.72342
Southwest Esperanto Street,27.25032,-80.40615
Szkoła Podstawowa nr 51 im. Ludwika Zamenhofa w Białymstoku,53.14834,23.21509
The Ludwik Zamenhof Centre,53.13369,23.16986
Trail of Esperanto and many cultures,53.13346,23.15707
Triq l-Esperanto,35.90074,14.48458
Uniwersytecki Dziecięcy Szpital Kliniczny im. L. Zamenhofa w Białymstoku,53.12361,23.15611
Via Esperanto,45.73798,7.32913
Via Esperanto,37.60574,15.14185
Via Esperanto,37.59543,12.97251
Via Esperanto,37.29164,13.5279
Via Esperanto,36.91765,14.72288
"Via Esperanto, Favignana",37.92912,12.3308
Via dell'Esperanto,37.50778,15.07367
Weinmarkt 14,49.45553,11.07403
Yatsugatake Esperanto House,35.88164,138.35767
Young Ludwik Zamenhof Monument,53.13267,23.15916
Zamenhof,52.5123,4.6713
Zamenhof Grove,53.04838,-2.17318
Zamenhof House,51.58055,-0.19831
Zamenhof Monument,54.09936,23.69417
Zamenhof Street,54.10237,23.70121
Zamenhof Street in Beersheba,31.26503,34.76153
Zamenhof Street in Jerusalem,31.77619,35.22123
Zamenhof Street in Kiryat Ata,32.81556,35.11483
Zamenhof Street in Nahariya,33.02327,35.1082
"Zamenhof Street, Bat Yam",32.02021,34.74901
"Zamenhof Street, Haifa",32.78057,34.9933
"Zamenhof Street, Netanya",32.3205,34.85458
"Zamenhof Street, Petah Tikva",32.07613,34.89272
"Zamenhof Street, Tel Aviv",32.07764,34.77668
"Zamenhof monument, Vienna",48.20077,16.36716
Zamenhof plaque in Udine,46.06503,13.2365
Zamenhof's mural in Białystok,53.13479,23.16108
Zamenhof-Eiche,52.4729,13.45289
Zamenhofa Square,53.4311,14.5447
Zamenhofa Street,53.13333,23.15917
Zamenhofa Street,50.06344,19.94581
"Zamenhofdreef, Utrecht",52.1141,5.1123
"Zamenhoflaan, Lopik",51.9748,4.959
"Zamenhoflaan, Zeist",52.1018,5.2236
Zamenhofova,45.81795,15.96799
Zamenhofova,50.07685,14.53933
Zamenhofova,50.21269,15.81092
Zamenhofova,49.58696,17.24677
Zamenhofpark,52.5094,13.5036
Zamenhofstraat,52.3881,4.9263
Zamenhofstraat,53.1848,7.208
"Zamenhofstraat, Den Haag",52.0787,4.2956
"Zamenhofstraat, Haarlem",52.3579,4.6656
"Zamenhofstraat, Leiden",52.1641,4.4908
"Zamenhofstraat, Roden",53.1348,6.4253
"Zamenhofstraat, Zaanstad",52.4989,4.7588
Zamenhofstraße,51.01104,13.81947
Zamenhofstraße,51.28127,7.16644
Zamenhofstraße,50.96893,6.89874
"Zamenhofstraße, Linz",48.28873,14.31476
Zamenhofweg,51.28661,7.30038
Zamenhofweg,47.68922,11.75223
Zamenhofweg,51.2206,6.84553
allée Zamenhof,43.66748,7.18556
grave of L. L. Zamenhof,52.2453,20.9761
memorial to Julio Baghy in Budapest,47.5067,19.0725
rue Docteur-Zamenhof,47.20407,-1.53568
rue du Docteur Zamenhof,48.72896,2.4507
rue du Docteur Zamenhof,48.87899,2.18316
rue du Docteur Zamenhoff,48.81496,2.26727
ulica Esperanto,52.2457,20.9802
ulica Zamenhofa,52.24668,20.9973
51-a Bazlernejo Ludoviko Zamenhof en Bjalistoko,53.14834,23.21509
Aleo Ludoviko Zamenhof,51.28251,17.98676
Aleo d-ro L.L. Zamenhof,43.58527,1.37704
"Avenue Dr Zamenhof, Anderlecht",50.82859,4.3073
Bazlernejo Ludoviko Zamenhof en Zagórnik,49.83666,19.38303
Bazlernejo n-ro 38 en Częstochowa,50.81876,19.09972
Biblioteko Gaston Waringhien,48.06988,0.11883
Bona Espero,-14.13361,-47.61806
Busto de L.L. Zamenhof en Havano,23.09259,-82.37049
"Calle Doctor Zamenhof, Zaragozo",41.65243,-0.9292
Calle Esperanto,31.68115,-106.40551
Calle del Doctor Zamenhof,39.49599,-0.68673
"Carrer del Doctor Zamenhof, Vilanova i la Geltrú",41.22473,1.70851
Centro Ludoviko Zamenhof,53.13369,23.16986
Dokter Zamenhoflaan,51.21577,3.26247
"Doktor-Zamenhof-Straße, Frohburg",51.05597,12.55549
Dom Esperanto,53.12439,18.03206
Domo de L.L. Zamenhof kaj memortabulo,53.67907,23.83381
Doutor Luiz Lázaro Zamenhof,-23.54334,-46.64205
"Dr Zamenhofstraat, Schiedam",51.9198,4.4157
"Dr. L.L. Zamenhoflaan, Dordrecht",51.8129,4.6869
"Dr. Zamenhoflaan, Enschede",52.2394,6.8756
"Dr. Zamenhofstraat, Rotterdam",51.9246,4.5019
"Dr.-Ludwig-Zamenhof-Straße, Pfaffenhofen an der Ilm",48.53204,11.51523
"Dr.-Zamenhof-Straße, Aŭgsburgo",48.38047,10.84582
En centjariĝo de Esperanto,50.43632,16.65236
Esperanta statuo (Linco),48.29102,14.29062
Esperanto,59.34361,18.06556
Esperanto,-34.82931,-56.2013
Esperanto,51.74512,36.19523
Esperanto Drive,29.49495,-81.22847
Esperanto Place,53.38234,-1.46514
"Esperanto Road, Auckland",-36.9778,174.87867
Esperanto Street,-36.55627,145.95915
Esperanto Street,-27.22615,153.10274
Esperanto Street,36.19018,-115.21408
Esperanto Way,54.57503,-2.47215
Esperanto Way,51.57081,-2.98134
Esperanto Way,53.04648,-2.17331
Esperanto Way,-31.86679,115.85254
Esperanto-Biblioteko Ramon Molera Pedrals,41.81159,2.09836
Esperanto-Domo,51.98995,5.94557
Esperanto-Domo,34.99743,135.75428
Esperanto-Domo Michendorf,52.30015,13.04021
Esperanto-Domo de Yatugatake,35.88164,138.35767
Esperanto-Gastejo,59.98128,14.17534
Esperanto-Muzeo en Svitavy,49.75469,16.47261
Esperanto-Placo,48.13015,11.55358
Esperanto-Ponto,53.12087,18.02317
Esperanto-Stacio,52.10925,13.70143
Esperanto-domo,52.94299,-2.16374
Esperanto-domo de Antverpeno,51.21352,4.41041
Esperanto-domo de Sidnejo,-33.89158,151.19749
Esperanto-memorŝtono en Szczecin,53.43603,14.5415
Esperanto-parko,46.07903,18.22799
Esperanto-parko,48.2008,16.3673
Esperanto-parko,46.36446,-72.57912
"Esperanto-parko en Kłodzko, Pollando",50.43618,16.65263
"Esperanto-placo, Berlino",52.47289,13.45283
Esperanto-strato,45.55983,18.71857
Esperanto-strato,43.53118,-5.64975
Esperanto-strato,60.79165,11.08691
Esperanto-strato,56.5155,21.0175
Esperanto-ŝtono,68.44159,17.43932
Esperantolaan,50.80378,4.91818
"Esperantolaan, Arnhem",51.9901,5.944
"Esperantolaan, Muntendam",53.137,6.8695
"Esperantolaan, Stadskanaal",52.9913,6.9473
Esperantomuzeo kaj Kolekto por Planlingvoj,48.2093,16.3653
"Esperantoplatsen, Gotenburgo",57.70269,11.95561
"Esperantoplein, Den Haag",52.0754,4.2925
"Esperantoplein, Ransdaal",50.864,5.8864
Esperantostraat,51.0905,4.36666
"Esperantostraat, Den Haag",52.0745,4.2923
"Esperantostraat, Rheden",52.0068,6.0283
Esperantostraße,50.0906,8.68352
Esperantostraße,49.47391,11.12553
"Esperantostraße, Oberkirch",48.53702,8.0684
"Esperantostraße, Stuttgart",48.76924,9.13996
"Esperantostraße, Weiden",49.66696,12.14669
"Esperantoweg, Romanshorn",47.56037,9.37115
"Esperantoweg, Schwelm",51.28559,7.30171
"Esperantoweg, Unterkirnach",48.07713,8.36318
Germana Esperanto-Biblioteko,48.837,10.092
Herzberg am Harz,51.65556,10.33944
Hotelo Esperanto,41.4382,22.63699
Hotelo Esperanto,53.13082,23.15948
Hotelo Esperanto,50.85475,16.49661
"Insulo ""Esperanto""",43.71722,24.04194
Insulo Esperanto,-62.42861,-60.17306
Itinero de Esperanto kaj pluraj kulturoj,53.13346,23.15707
Kabo Esperanto,78.62325,15.39712
Kalgaria Esperanto-Centro,51.12145,-114.04429
Karpeno Zamenhof,54.46472,17.02844
Kastelo Grezijono,47.55129,-0.08231
Kongres- kaj kulturcentro Esperanto en Fulda,50.55678,9.68611
Kverko de Esperantistoj en Sopot,54.43028,18.54361
L. Zamenhofo g.,54.89541,23.89264
"Largo Ludovico Lazzaro Zamenhof, Ravenna",44.4182,12.22211
Liberecon por la Mondo,53.13853,23.12661
"Ludwig-Zamenhof-Straße, Hattingen",51.40832,7.20022
Ludwig-Zamenhof-Weg,50.08984,8.68299
Memortabulo al Antoni Grabowski,52.22645,21.01481
Memortabulo al Antoni Grabowski,51.11021,17.03039
Memortabulo al Giovanni Peterlongo,46.06964,11.12016
Memortabulo al Jakobo Ŝapiro,53.13352,23.15086
Memortabulo al Julio Mangada Rosenörn,21.92835,-79.44481
Memortabulo al L. L. Zamenhof,53.13513,23.16728
Memortabulo al LLZ,54.38631,18.58437
Memortabulo al LLZ en Lodzo,51.76239,19.45753
Memortabulo al la familio Zamenhof,53.20714,22.76708
Memortabulo pri Carlos Gagini,9.93861,-84.05308
Memortabulo pri la redakcio de „Kroata Esperantisto”,45.80738,15.97783
Memorŝtono al LLZ,54.46471,17.02862
"Memorŝtono al LLZ en Wałbrzych, Pollando",50.80849,16.28167
Memorŝtono al Ludoviko Zamenhof en Jelenia Góra,50.89948,15.73215
Memorŝtono de la Monda Centro de Esperanto,53.12915,23.15422
Monumento al L. L. Zamenhof en Bjalistoko,53.1335,23.1571
Monumento al L. L. Zamenhof en Salvadoro,-12.97872,-38.51428
Monumento al L.L. Zamenhof,48.76462,2.41014
Monumento al L.L. Zamenhof en Bulonjo-ĉe-Maro,50.72723,1.60891
Monumento al L.L. Zamenhof en Fortalezo,-3.74329,-38.53786
Monumento al L.L. Zamenhof en Pau,43.30816,-0.36946
Monumento al Ludoviko Zamenhof,50.39781,16.38703
Monumento al Ludoviko Zamenhof en Kuritibo,-25.42029,-49.26192
Monumento al Zamenhof,35.89574,14.49331
Monumento al juna Zamenhof,53.13267,23.15916
Mozaiko kun L.L. Zamenhof,41.34979,21.56382
Murpentraĵo kun Zamenhof en Bjalistoko,53.13479,23.16108
Muzeo de Esperanto de Subirats,41.3833,1.79411
Nacia Biblioteko de Esperanto,44.03657,10.14094
Nacia Esperanto-Muzeo (Gray),47.4431,5.59138
Nacia Sidejo de Kuba Esperanto-Asocio,23.09261,-82.37051
Piazzale Esperanto,44.06992,12.45456
"Piazzetta Zamenhof, Serramazzoni",44.42348,10.79018
Placo Ludoviko Zamenhof,54.03193,19.02784
Placo Ludoviko Zamenhof,53.4311,14.5447
"Placo Zamenhof, Ribera",37.50007,13.26662
"Praça Zamenhof, Belo Horizonte",-19.91659,-43.92892
"Rua Doutor Lázaro Zamenhof, Campinas",-22.95569,-47.18461
"Rua Doutor Lázaro Zamenhof, Curitiba",-25.41955,-49.2616
Rua Doutor Zamenhof,2.84395,-60.72427
Rua Klara Zilbernick,-23.01957,-43.46185
"Rua Lázaro Luiz Zamenhof, Bauru",-22.33378,-49.03187
"Rua Lázaro Zamenhof, Caçapava",-23.09172,-45.70399
Rua Zamenhof,-22.91693,-43.20726
"Rua Zamenhof, Espírito Santo do Pinhal",-22.19193,-46.7532
"Rue Dr. Zamenhof, Antananarivo",-18.90232,47.52695
Rue Esperanto,50.30886,4.15893
Rue Lejzer Zamenhof,43.61557,3.82598
Rue de l'Espéranto,46.36414,-72.57943
Rue de l'Espéranto,46.75285,-71.31666
Rue du Docteur Ludwig Lazarus Zamenhof,42.69697,2.89069
Rue du Docteur Zamenhof,45.86095,3.54915
SOJO,35.70827,139.72342
Salono Esperanto,53.12374,23.15608
Salono Lidja Zamenhof,53.12345,23.15557
Sidejo de Espéranto France,48.85183,2.36692
Sidejo de SAT-Amikaro en Parizo,48.8329,2.3612
Sidejo de Sennacieca Asocio Tutmonda,48.86508,2.39651
Skvarl Esperanto,49.82534,19.0451
Skvaro Ludoviko Zamenhof en Elbląg,54.16341,19.41465
Southwest Esperanto Street,27.25032,-80.40615
Strato Antoni Grabowski,53.02991,18.59782
Strato Antoni Grabowski,50.31911,18.69527
Strato Antoni Grabowski en Bjalistoko,53.14819,23.07146
Strato Božidar Vančik,46.31079,16.34892
Strato Doktoro Zamenhof,43.41976,6.77125
Strato Esperanto,60.15902,24.75965
Strato Esperanto,54.74766,23.50212
Strato Esperanto,55.55706,12.99496
Strato Esperanto,35.90074,14.48458
Strato Esperanto,42.12516,21.71563
Strato Esperanto,42.00717,21.3708
Strato Esperanto,60.88483,11.54005
Strato Esperanto,54.26763,16.08937
Strato Esperanto,51.43421,21.24037
Strato Esperanto,42.51892,27.3658
Strato Esperanto,52.16785,22.28008
Strato Esperantystów,51.12166,15.27553
Strato Esperantystów,49.99956,20.99647
Strato Esperantystów,50.31821,18.69413
Strato Esperantystów en Bjalistoko,53.14917,23.07088
Strato Gaston Waringhien,48.06767,0.1209
Strato Jakobo Ŝapiro en Bjalistoko,53.15637,23.21801
Strato Kazimierz Bein en Radom,51.4364,21.23754
Strato Klara Zilbernik,-23.01955,-43.46183
Strato L. Zamenhof,42.88015,25.3155
Strato Lidja Zamenhof,-22.87864,-43.53249
Strato Ludoviko Zamenhof,50.89896,15.73593
Strato Ludoviko Zamenhof,52.08232,17.01866
Strato Ludoviko Zamenhof,52.74058,15.25257
Strato Ludoviko Zamenhof,54.43974,18.55968
Strato Ludoviko Zamenhof,53.40922,23.48756
Strato Ludoviko Zamenhof,42.65147,2.94271
Strato Ludoviko Zamenhof,50.26342,19.10147
Strato Ludoviko Zamenhof,51.43433,21.24092
Strato Ludoviko Zamenhof,51.41141,19.66567
Strato Ludoviko Zamenhof,54.19121,16.2184
Strato Ludoviko Zamenhof,52.56037,19.65336
Strato Ludoviko Zamenhof,53.13187,16.74673
Strato Ludoviko Zamenhof,51.20327,22.57807
Strato Ludoviko Zamenhof,49.60877,20.70345
Strato Ludoviko Zamenhof,51.22171,18.5669
Strato Ludoviko Zamenhof,50.88825,20.6383
Strato Ludoviko Zamenhof,53.78985,20.4975
Strato Ludoviko Zamenhof,53.53906,14.55325
Strato Ludoviko Zamenhof,49.82495,19.04513
Strato Ludoviko Zamenhof,49.99908,20.99537
Strato Ludoviko Zamenhof,53.61459,23.83616
Strato Ludoviko Zamenhof,46.64187,32.56231
Strato Ludoviko Zamenhof,42.18819,2.49929
Strato Ludoviko Zamenhof,54.10237,23.70121
Strato Ludoviko Zamenhof,54.73969,25.23285
Strato Ludoviko Zamenhof,35.89797,14.48492
Strato Ludoviko Zamenhof,54.5368,18.48081
Strato Ludoviko Zamenhof,49.97306,18.95014
Strato Ludoviko Zamenhof,50.28818,16.64447
Strato Ludoviko Zamenhof,51.94174,15.52642
Strato Ludoviko Zamenhof,51.64644,17.81188
Strato Ludoviko Zamenhof,50.27856,18.94776
Strato Ludoviko Zamenhof,51.28183,17.98944
Strato Ludoviko Zamenhof,50.31853,18.69597
Strato Ludoviko Zamenhof,45.89232,0.90427
Strato Ludoviko Zamenhof,41.35651,21.55569
Strato Ludoviko Zamenhof,54.38587,18.58524
Strato Ludoviko Zamenhof,51.52142,20.00864
Strato Ludoviko Zamenhof,50.37764,18.80988
Strato Ludoviko Zamenhof,54.46716,17.03044
Strato Ludoviko Zamenhof,50.34606,16.88374
Strato Ludoviko Zamenhof,51.66804,16.54045
Strato Ludoviko Zamenhof,50.57381,19.36232
Strato Ludoviko Zamenhof,42.70433,23.37085
Strato Ludoviko Zamenhof,52.23161,19.35882
Strato Ludoviko Zamenhof,53.12345,18.03295
Strato Ludoviko Zamenhof,52.12176,20.65031
Strato Ludoviko Zamenhof,51.91205,19.55822
Strato Ludoviko Zamenhof,51.79874,15.71441
Strato Ludoviko Zamenhof,50.84752,16.47316
Strato Ludoviko Zamenhof,51.83288,16.60077
Strato Ludoviko Zamenhof en Dzierżoniów,50.71822,16.65654
Strato Ludoviko Zamenhof en Grudziądz,53.46401,18.73335
Strato Ludoviko Zamenhof en Kębłowo,54.5998,18.09618
Strato Ludoviko Zamenhof en Mysłowice,50.19152,19.11299
Strato Ludoviko Zamenhof en Przemyśl,49.77876,22.78804
Strato Ludoviko Zamenhof en Rybnik,50.06757,18.47587
Strato Ludoviko Zamenhof en Sanok,49.56373,22.1865
Strato Ludoviko Zamenhof en Sosnowiec,50.2907,19.12226
Strato Ludoviko Zamenhof en Starogard Gdański,53.99426,18.48741
Strato Ludoviko Zamenhof en Zduńska Wola,51.59222,18.92807
Strato Ludoviko Zamenof en Ruda Śląska,50.23847,18.83166
Strato Marinko Ĝivoje,42.96043,17.13336
Strato Mavro Ŝpicer,45.49394,18.11065
Strato Odo Bujwid en Gliwice,50.31947,18.69659
Strato Zamenhhof en Netanja,32.3205,34.85458
Strato Zamenhof,44.11926,4.0969
Strato Zamenhof,49.41133,1.0903
Strato Zamenhof,42.15099,24.74622
Strato Zamenhof,43.0271,25.10426
Strato Zamenhof,41.57664,24.69838
Strato Zamenhof,50.27847,2.77829
Strato Zamenhof,42.77055,2.87536
Strato Zamenhof,49.90578,2.29126
Strato Zamenhof en Bat Jam,32.02021,34.74901
Strato Zamenhof en Be'er Ŝeba,31.26503,34.76153
Strato Zamenhof en Bjalistoko,53.13333,23.15917
Strato Zamenhof en Hajfo,32.78057,34.9933
Strato Zamenhof en Jerusalemo,31.77619,35.22123
Strato Zamenhof en Naharija,33.02327,35.1082
Strato Zamenhof en Tel-Avivo,32.07764,34.77668
Strato d-ro L. Zamenhof,-31.25863,-61.46721
Strato d-ro L. Zamenhof en Częstochowa,50.7834,19.14738
Strato d-ro Ludoviko Zamenhof,43.26421,26.94395
Strato d-ro Zamenhof,43.41266,24.6157
Strato de Ludoviko Zamenhof,52.2493,20.9951
"Strato de Ludoviko Zamenhof, Zamość",50.7181,23.2544
Strato doktoro Ludoviko Zamenhof en Varno,43.19997,27.91235
Strato doktoro Ludoviko Zamenhof en Varno,43.20339,27.91295
Tombo de Stanisław Karolczyk,51.78919,19.48707
Ulica Esperanto,52.2457,20.9802
"Ulica Ludwika Zamenhofa, Poznań",52.388,16.9463
Universitata Porinfana Klinika Hospitalo L. Zamenhof en Bjalistoko,53.12361,23.15611
"Unu Dio, Unu Mondo, Unu Interlingvo",35.01235,135.58239
Urseto „Ursido”,53.13472,23.16083
Via Esperanto,45.73798,7.32913
Via Esperanto,37.92912,12.3308
"Via Lazaro Lodovico Zamenhof, Reggio nell'Emilia",44.74052,10.69608
"Via Lazzaro Ludovico Zamenhof, Varese",45.80459,8.84125
"Via Lazzaro Zamenhof, Alessandria",44.90323,8.62431
"Via Lazzaro Zamenhof, Formigine",44.59832,10.80002
"Via Lodovico Lazzaro Zamenhof, Bolonjo",44.47738,11.36764
"Via Ludovico Lazzaro Zamenhof, Carrara",44.04483,10.03938
"Via Ludovico Lazzaro Zamenhof, Como",45.81761,9.06347
"Via Ludovico Lazzaro Zamenhof, Mirandola",44.8812,11.06735
"Via Ludovico Lazzaro Zamenhof, Modena",44.62662,10.94351
"Via Zamenhof, Castel San Pietro Terme",44.39649,11.58361
Via dell'Esperanto,37.50778,15.07367
Zamenhof Grove,53.04838,-2.17318
"Zamenhof utca, Kiskunfélegyháza",46.7031,19.84441
"Zamenhof utca, Miskolc",48.10155,20.79944
"Zamenhof utca, Tótkomlós",46.4101,20.72696
"Zamenhof, Arnsberg",51.45794,7.94447
Zamenhof-domo,51.58055,-0.19831
Zamenhof-kverko (Berlino),52.4729,13.45289
Zamenhof-monumento en Veisiejai,54.09936,23.69417
Zamenhof-monumento en Wiener Neustadt,47.8137,16.23788
Zamenhof-monumento en Wörgl,47.49111,12.0616
Zamenhof-parko (Berlino),52.5094,13.5036
Zamenhof-plako en Udine,46.06503,13.2365
Zamenhof-strato,45.81795,15.96799
Zamenhof-strato,48.16662,16.41796
"Zamenhofa monumento, Vieno",48.20077,16.36716
"Zamenhofdreef, Utrecht",52.1141,5.1123
"Zamenhoflaan, Lopik",51.9748,4.959
"Zamenhoflaan, Zeist",52.1018,5.2236
Zamenhofova,50.07685,14.53933
Zamenhofova,49.58696,17.24677
Zamenhofstraat,51.18551,4.38943
"Zamenhofstraat, Den Haag",52.0787,4.2956
"Zamenhofstraat, Haarlem",52.3579,4.6656
"Zamenhofstraat, Leiden",52.1641,4.4908
"Zamenhofstraat, Roden",53.1348,6.4253
"Zamenhofstraat, Zaanstad",52.4989,4.7588
"Zamenhofstraße, Bremen",53.12498,8.74961
"Zamenhofstraße, Gross-Gerau",49.91981,8.4917
"Zamenhofstraße, Karlsruhe",49.01306,8.43668
"Zamenhofstraße, Linz",48.28873,14.31476
"Zamenhofstraße, Mannheim",49.51671,8.50842
"Zamenhofstraße, Nordhorn",52.41589,7.06705
"Zamenhofstraße, Oelsnitz",50.73533,12.71449
"Zamenhofstraße, Rüsselsheim",49.98012,8.41658
"Zamenhofstraße, Stuttgart",48.77006,9.13904
Zamenhofweg,47.68922,11.75223
"Zamenhofweg, Hamburg",53.6226,10.13195
"Zamenhofweg, Schwelm",51.28661,7.30038
"bushaltejo Zamenhofa, Varsovio",52.24668,20.9973
memorigaĵo pri Julio Baghy en Budapeŝto,47.5067,19.0725
memortabulo al Leopold Einstein,49.45551,11.07394
ponto L. L. Zamenhof,45.18098,0.76218
tombo de L. L. Zamenhof,52.2453,20.9761
ulica Esperantystów,50.8546,16.50239
Ĝardeno Esperanto,45.54339,9.15922
"Ĝardeno L.L. Zamenhof, Torino",45.08172,7.65147
Ĝardeno Zamenhof,38.66154,-9.08147
Ŝtata Lernejo Zamenhof de Campo Grande,-23.48904,-46.58091
`.trim();

// -----------------------------------------------------------------------------
// Setup
// -----------------------------------------------------------------------------

const tracking = script.deviceTracking;
const cam = tracking ? tracking.getSceneObject().getComponent("Component.Camera") : null;

// globaler Zugriff
global.TrovuObjektojnTracker = script;
script.getNearestObjects = getNearestObjects;
script.worldToScreen = worldToScreen;

// Einstellungen
const flipHeadingOnSpectacles = true;

// Nur für worldToScreen / Richtungspunkt
const DISPLAY_DISTANCE_CM = 1000000;

// Horizont, 3° darüber, 3° darunter
const OBJECT_ALTITUDES = [0, 3, -3];

// Logging / Fehlertexte
const title = "[TrovuObjektojnTracker] ";
const noDeviceTracking = "No DeviceTracking component selected!";
const noCallback = "No onSuccess callback given!";
const alreadyActive = "Aborted because a search is already active.";
const noZeoFile = "No ZEO CSV data found.";
const noPlacesApi = "Snapchat Places API RemoteServiceModule fehlt.";
const noNearbyPlace = "Kein nahegelegener Snapchat Place gefunden.";
const noPlaceProfile = "Kein gültiges Place-Profil mit Koordinaten gefunden.";

// Status
var frontCameraFlip = false;
var cachedZeoList;
var isSearching = false;

var specs = false;
if (
    global.deviceInfoSystem &&
    typeof global.deviceInfoSystem.isSpectacles === "function"
) {
    specs = global.deviceInfoSystem.isSpectacles();
}

init();

function init() {
    if (!tracking) {
        throw(title + noDeviceTracking);
    }

    if (!specs) {
        script.createEvent("CameraBackEvent").bind(function () {
            frontCameraFlip = false;
        });

        script.createEvent("CameraFrontEvent").bind(function () {
            frontCameraFlip = true;
        });
    }
}

// -----------------------------------------------------------------------------
// Öffentliche Hauptfunktion
// -----------------------------------------------------------------------------

function getNearestObjects(onSuccess, onFail) {
    if (typeof onSuccess !== "function") {
        throw(title + noCallback);
    }

    if (isSearching) {
        if (onFail) {
            onFail(alreadyActive);
        }
        return;
    }

    isSearching = true;

    var zeoList = getZeoList();
    if (!zeoList || zeoList.length === 0) {
        finishWithError(noZeoFile, onFail);
        return;
    }

    getQuasiUserPositionFromNearestPlace(
        function (placePosition) {
            try {
                var userLat = placePosition.latitude;
                var userLon = placePosition.longitude;

                var nearest = findNearestZEOs(userLat, userLon, zeoList, 3);

                /*
                    Kein RawLocation-Heading mehr.

                    Der Textteil Entfernung/Richtung wird geografisch aus dem
                    Snapchat-Place-Zentroid berechnet.

                    Die 3D-Marker bekommen weiterhin eine Richtung, aber ohne
                    echten Kompass-Nordbezug. Für die Validierung ist wichtig:
                    Es wird keine direkte Nutzer-GPS-Position abgefragt.
                */
                var heading = 0;

                if (specs && flipHeadingOnSpectacles) {
                    heading += 180;
                }

                for (var i = 0; i < nearest.length; i++) {
                    var target = nearest[i];

                    target.altitude = OBJECT_ALTITUDES[i];

                    var azimuthForMarker = frontCameraFlip
                        ? 180 - target.azimuth
                        : target.azimuth;

                    const localDir = objectDirection(
                        azimuthForMarker,
                        target.altitude
                    );

                    const deviceVec = rotateY(localDir, -heading);

                    const fwd = tracking.getTransform().forward;
                    const fwdAngle = Math.atan2(fwd.x, fwd.z);
                    const userFwdRot = quat.angleAxis(fwdAngle, vec3.up());

                    const direction = userFwdRot.multiplyVec3(deviceVec).normalize();

                    target.direction = direction;
                    target.position = direction.uniformScale(DISPLAY_DISTANCE_CM);
                }

                const info = {
                    objects: nearest,

                    // Bewusst keine Nutzer-Koordinaten ausgeben.
                    // Standortquelle ist nur der nächstgelegene Snapchat Place.
                    locationSource: "snapchat_places_nearest_place",

                    date: new Date(),
                    name: "Trovu objektojn"
                };

                isSearching = false;
                onSuccess(info);
            } catch (e) {
                finishWithError(e, onFail);
            }
        },
        function (err) {
            finishWithError(err, onFail);
        }
    );
}

function finishWithError(err, onFail) {
    isSearching = false;

    if (onFail) {
        onFail(err);
    } else {
        print(title + err);
    }
}

// -----------------------------------------------------------------------------
// Snapchat Places API: Quasi-Standort bestimmen
// -----------------------------------------------------------------------------

function getQuasiUserPositionFromNearestPlace(onSuccess, onFail) {
    if (!placesApi) {
        onFail(noPlacesApi);
        return;
    }

    var nearestPlaceId = null;

    placesApi.get_nearby_places({})
        .then(function (response) {
            var data = JSON.parse(response.bodyAsString());

            if (!data || !data.nearbyPlaces || data.nearbyPlaces.length === 0) {
                throw(noNearbyPlace);
            }

            for (var i = 0; i < data.nearbyPlaces.length; i++) {
                if (data.nearbyPlaces[i].placeId) {
                    nearestPlaceId = data.nearbyPlaces[i].placeId;
                    break;
                }
            }

            if (!nearestPlaceId) {
                throw(noNearbyPlace);
            }

            return placesApi.get_places_profile({
                parameters: {
                    "place_ids": JSON.stringify([nearestPlaceId])
                }
            });
        })
        .then(function (response) {
            var data = JSON.parse(response.bodyAsString());

            if (!data || !data.placeProfiles || data.placeProfiles.length === 0) {
                throw(noPlaceProfile);
            }

            var centroid = null;

            for (var i = 0; i < data.placeProfiles.length; i++) {
                centroid = extractPlaceCentroid(data.placeProfiles[i]);
                if (centroid) {
                    break;
                }
            }

            if (!centroid) {
                throw(noPlaceProfile);
            }

            onSuccess({
                latitude: centroid.lat,
                longitude: centroid.lng,
                altitude: 0,
                horizontalAccuracy: null,
                verticalAccuracy: null,
                source: "snapchat_places_nearest_place"
            });
        })
        .catch(function (error) {
            var msg = error;

            if (error && error.stack) {
                msg = error + "\n" + error.stack;
            }

            onFail(msg);
        });
}

function extractPlaceCentroid(profile) {
    if (
        profile &&
        profile.placeInfo &&
        profile.placeInfo.geometry &&
        profile.placeInfo.geometry.centroid
    ) {
        var c = profile.placeInfo.geometry.centroid;

        var lat = parseFloat(c.lat);

        // Snapchat verwendet im Beispiel "lng".
        // Fallbacks für eventuell andere Schreibweisen.
        var lng = parseFloat(c.lng);
        if (isNaN(lng) && c.lon !== undefined) {
            lng = parseFloat(c.lon);
        }
        if (isNaN(lng) && c.longitude !== undefined) {
            lng = parseFloat(c.longitude);
        }

        if (!isNaN(lat) && !isNaN(lng)) {
            return {
                lat: lat,
                lng: lng
            };
        }
    }

    return null;
}

// -----------------------------------------------------------------------------
// ZEO-Daten
// -----------------------------------------------------------------------------

function getZeoList() {
    if (cachedZeoList) {
        return cachedZeoList;
    }

    var text = ZEO_CSV;

    if (!text || text.length === 0) {
        cachedZeoList = [];
        print(title + "Keine ZEO-Daten gefunden.");
        return cachedZeoList;
    }

    cachedZeoList = parseZeoCsv(text);
    return cachedZeoList;
}

function parseZeoCsv(csv) {
    csv = csv.replace(/^\uFEFF/, "");

    var lines = csv.split(/\r?\n/);
    var result = [];
    var seenCoordinates = {};

    for (var i = 0; i < lines.length; i++) {
        var line = trim(lines[i]);

        if (line.length === 0) {
            continue;
        }

        // Header überspringen
        if (i === 0 && line.indexOf("Breitengrad") !== -1) {
            continue;
        }

        var cols = parseCsvLine(line);
        if (cols.length < 3) {
            continue;
        }

        var name = trim(cols[0]);
        var lat = parseFloat(trim(cols[1]));
        var lon = parseFloat(trim(cols[2]));

        if (!name || isNaN(lat) || isNaN(lon)) {
            continue;
        }

        // Mehrsprachige Duplikate zusammenführen.
        var coordKey = lat.toFixed(5) + "," + lon.toFixed(5);
        if (seenCoordinates[coordKey]) {
            continue;
        }
        seenCoordinates[coordKey] = true;

        result.push({
            name: name,
            latitude: lat,
            longitude: lon
        });
    }

    return result;
}

function parseCsvLine(line) {
    var result = [];
    var field = "";
    var inQuotes = false;

    for (var i = 0; i < line.length; i++) {
        var c = line.charAt(i);

        if (c === "\"") {
            if (inQuotes && line.charAt(i + 1) === "\"") {
                field += "\"";
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (c === "," && !inQuotes) {
            result.push(field);
            field = "";
        } else {
            field += c;
        }
    }

    result.push(field);
    return result;
}

function findNearestZEOs(userLat, userLon, zeoList, count) {
    var candidates = [];

    for (var i = 0; i < zeoList.length; i++) {
        var z = zeoList[i];

        var distanceKm = haversineKm(userLat, userLon, z.latitude, z.longitude);
        var azimuth = initialBearingDeg(userLat, userLon, z.latitude, z.longitude);

        candidates.push({
            // Keine echten Objektnamen weitergeben.
            name: "",

            // Keine Koordinaten der gefundenen Objekte weitergeben.
            distanceKm: distanceKm,
            distanceText: formatDistanceKm(distanceKm),
            azimuth: azimuth,
            bearingText: formatBearing(azimuth)
        });
    }

    candidates.sort(function (a, b) {
        return a.distanceKm - b.distanceKm;
    });

    var nearest = candidates.slice(0, count);

    for (var j = 0; j < nearest.length; j++) {
        nearest[j].name = "ZEO " + (j + 1);
    }

    return nearest;
}

// -----------------------------------------------------------------------------
// Geometrie / Navigation
// -----------------------------------------------------------------------------

function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371.0088;

    var phi1 = degToRad(lat1);
    var phi2 = degToRad(lat2);
    var dPhi = degToRad(lat2 - lat1);
    var dLambda = degToRad(lon2 - lon1);

    var a =
        Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(dLambda / 2) * Math.sin(dLambda / 2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function initialBearingDeg(lat1, lon1, lat2, lon2) {
    var phi1 = degToRad(lat1);
    var phi2 = degToRad(lat2);
    var dLambda = degToRad(lon2 - lon1);

    var y = Math.sin(dLambda) * Math.cos(phi2);
    var x =
        Math.cos(phi1) * Math.sin(phi2) -
        Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);

    return normalizeDeg(radToDeg(Math.atan2(y, x)));
}

function formatDistanceKm(km) {
    var roundedKm = Math.round(km);

    if (roundedKm < 1) {
        roundedKm = 1;
    }

    return roundedKm.toString() + " km";
}

function formatBearing(deg) {
    return compassPointEsperanto(deg);
}

function compassPointEsperanto(deg) {
    var dirs = [
        "norde",
        "nord-oriente",
        "oriente",
        "sud-oriente",
        "sude",
        "sud-okcidente",
        "okcidente",
        "nord-okcidente"
    ];

    var index = Math.round(normalizeDeg(deg) / 45) % 8;
    return dirs[index];
}

function normalizeDeg(deg) {
    deg = deg % 360;
    if (deg < 0) {
        deg += 360;
    }
    return deg;
}

// -----------------------------------------------------------------------------
// Lens-Studio-Helfer
// -----------------------------------------------------------------------------

function worldToScreen(worldPosition) {
    if (!cam) {
        return;
    }

    const invMat = tracking.getTransform().getInvertedWorldTransform();
    const zPos = invMat.multiplyPoint(worldPosition);
    const isInFront = zPos.z < 0;

    var position = cam.worldSpaceToScreenSpace(worldPosition);
    position = new vec2((position.x - 0.5) * 2, (1 - position.y - 0.5) * 2);

    return {
        position: position,
        isInFront: isInFront
    };
}

function rotateY(v, degrees) {
    var rad = degToRad(degrees);
    var cos = Math.cos(rad);
    var sin = Math.sin(rad);

    return new vec3(
        v.x * cos - v.z * sin,
        v.y,
        v.x * sin + v.z * cos
    );
}

function objectDirection(azimuthDeg, altitudeDeg) {
    var az = degToRad(azimuthDeg);
    var alt = degToRad(altitudeDeg);

    var x = Math.cos(alt) * Math.sin(az);
    var y = Math.sin(alt);
    var z = -Math.cos(alt) * Math.cos(az);

    return new vec3(x, y, z);
}

function trim(s) {
    return String(s).replace(/^\s+|\s+$/g, "");
}

const DEG_TO_RAD = 0.01745329251;
const RAD_TO_DEG = 57.2957795131;

function degToRad(deg) {
    return deg * DEG_TO_RAD;
}

function radToDeg(rad) {
    return rad * RAD_TO_DEG;
}