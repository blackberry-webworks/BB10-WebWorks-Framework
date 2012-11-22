describe("remoteFunctionCall", function () {
    describe("GET method", function () {
        it("should be able to verifiy webworks hash and version", function () {
            var xhr = new XMLHttpRequest(),
                badHash = "ABC123",
                badVersion = "1.0.0.20";

            xhr.open("GET", "http://localhost:8472/extensions/get/?hash=" + badHash + "&version=" + badVersion, false);
            xhr.send();
            expect(xhr.status).toBe(412);
        });

        it("should return forbidden when specifying a non whitelisted extension", function () {
            var xhr = new XMLHttpRequest();

            xhr.open("GET", "http://localhost:8472/extensions/load/blackberry.null", false);
            xhr.send();
            expect(xhr.status).toBe(403);
        });

        it("should be able to load an extension with /extension/load/<extension>/", function () {
            var xhr = new XMLHttpRequest(),
                extension;

            xhr.open("GET", "http://localhost:8472/extensions/load/blackberry.identity", false);
            xhr.send();
            extension = JSON.parse(decodeURIComponent(xhr.response));
            expect(xhr.status).toBe(200);
            expect(extension.client).toBeDefined();
        });

        it("should return the whitelisted extensions with /extensions/get/", function () {
            var xhr = new XMLHttpRequest(),
                extensions;

            xhr.open("GET", "http://localhost:8472/extensions/get/", false);
            xhr.send();
            extensions = JSON.parse(decodeURIComponent(xhr.response)).data;
            expect(xhr.status).toBe(200);
            expect(extensions).toContain("blackberry.app");
            expect(extensions).toContain("blackberry.system");
            expect(extensions).toContain("blackberry.connection");
            expect(extensions).toContain("blackberry.identity");
            expect(extensions).toContain("blackberry.event");
            expect(extensions).toContain("blackberry.ui.dialog");
            expect(extensions).toContain("blackberry.io");
            expect(extensions).toContain("blackberry.io.filetransfer");
            expect(extensions).toContain("blackberry.bbm.platform");
            expect(extensions).toContain("blackberry.invoked");
            expect(extensions).toContain("blackberry.invoke");
        });

        it("should return 404 for non-existent method", function () {
            var xhr = new XMLHttpRequest();

            xhr.open("GET", "http://localhost:8472/blackberry.app/someMethod", false);
            xhr.send();
            expect(xhr.status).toBe(404);
            expect(xhr.response).toBe("%7B%22code%22%3A-1%2C%22data%22%3Anull%2C%22msg%22%3A%22Method%20someMethod%20for%20blackberry.app%20not%20found%22%7D");
        });
    });

    describe("POST method", function () {
        // Used dialog to confirm text is sent back.
        xit("should not hit limit set by GET method. i.e. no more parse error", function () {
            var settings = {title : "POST Test", size : blackberry.ui.dialog.SIZE_SMALL, position : blackberry.ui.dialog.TOP},
                largePostText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quo minus animus a se ipse dissidens secumque discordans gustare partem ullam liquidae voluptatis et liberae potest. Itaque si aut requietem natura non quaereret aut eam posset alia quadam ratione consequi. Cum praesertim illa perdiscere ludus esset. Quae hic rei publicae vulnera inponebat, eadem ille sanabat. Duo Reges: constructio interrete. Bestiarum vero nullum iudicium puto. Atque ut a corpore ordiar, videsne ut, si quae in membris prava aut debilitata aut inminuta sint, occultent homines? Num igitur utiliorem tibi hunc Triarium putas esse posse, quam si tua sint Puteolis granaria? An tu me de L. Non dolere, inquam, istud quam vim habeat postea videro; Hanc ergo intuens debet institutum illud quasi signum absolvere. Venit ad extremum; Qui autem de summo bono dissentit de tota philosophiae ratione dissentit. Plane idem, inquit, et maxima quidem, qua fieri nulla maior potest. Quae possunt eadem contra Carneadeum illud summum bonum dici, quod is non tam, ut probaret, protulit, quam ut Stoicis, quibuscum bellum gerebat, opponeret. Quocirca intellegi necesse est in ipsis rebus, quae discuntur et cognoscuntur, invitamenta inesse, quibus ad discendum cognoscendumque moveamur. Tum ille timide vel potius verecunde: Facio, inquit. Hic Speusippus, hic Xenocrates, hic eius auditor Polemo, cuius illa ipsa sessio fuit, quam videmus. Te enim iudicem aequum puto, modo quae dicat ille bene noris. Qualis ista philosophia est, quae non interitum afferat pravitatis, sed sit contenta mediocritate vitiorum? Idcirco enim non desideraret, quia, quod dolore caret, id in voluptate est. Memini vero, inquam; Ita enim vivunt quidam, ut eorum vita refellatur oratio. Esse enim, nisi eris, non potes. Ergo instituto veterum, quo etiam Stoici utuntur, hinc capiamus exordium. Sic enim maiores nostri labores non fugiendos tristissimo tamen verbo aerumnas etiam in deo nominaverunt. Minime vero, inquit ille, consentit. Quo minus animus a se ipse dissidens secumque discordans gustare partem ullam liquidae voluptatis et liberae potest. Satisne ergo pudori consulat, si quis sine teste libidini pareat? Sin ea non neglegemus neque tamen ad finem summi boni referemus, non multum ab Erilli levitate aberrabimus. Sed existimo te, sicut nostrum Triarium, minus ab eo delectari, quod ista Platonis, Aristoteli, Theophrasti orationis ornamenta neglexerit. Sed tamen intellego quid velit. Primum in nostrane potestate est, quid meminerimus? Cuius similitudine perspecta in formarum specie ac dignitate transitum est ad honestatem dictorum atque factorum. Consequatur summas voluptates non modo parvo, sed per me nihilo, si potest; In qua si nihil est praeter rationem, sit in una virtute finis bonorum; Illa argumenta propria videamus, cur omnia sint paria peccata. Qua tu etiam inprudens utebare non numquam. Atque ut a corpore ordiar, videsne ut, si quae in membris prava aut debilitata aut inminuta sint, occultent homines? Quis est, qui non oderit libidinosam, protervam adolescentiam? Portenta haec esse dicit, neque ea ratione ullo modo posse vivi; Quae in controversiam veniunt, de iis, si placet, disseramus. Satisne igitur videor vim verborum tenere, an sum etiam nunc vel Graece loqui vel Latine docendus? Atque hoc loco similitudines eas, quibus illi uti solent, dissimillimas proferebas. Quid enim tanto opus est instrumento in optimis artibus comparandis? Memini vero, inquam; Perturbationes autem nulla naturae vi commoventur, omniaque ea sunt opiniones ac iudicia levitatis. Sin tantum modo ad indicia veteris memoriae cognoscenda, curiosorum. Num igitur eum postea censes anxio animo aut sollicito fuisse? Teneo, inquit, finem illi videri nihil dolere. Est autem a te semper dictum nec gaudere quemquam nisi propter corpus nec dolere. Luxuriam non reprehendit, modo sit vacua infinita cupiditate et timore. Expectoque quid ad id, quod quaerebam, respondeas. Deinde qui fit, ut ego nesciam, sciant omnes, quicumque Epicurei esse voluerunt? An ea, quae per vinitorem antea consequebatur, per se ipsa curabit? Ab his oratores, ab his imperatores ac rerum publicarum principes extiterunt. Atque haec coniunctio confusioque virtutum tamen a philosophis ratione quadam distinguitur. Ergo, si semel tristior effectus est, hilara vita amissa est? Nec vero pietas adversus deos nec quanta iis gratia debeatur sine explicatione naturae intellegi potest. Huius ego nunc auctoritatem sequens idem faciam. Quid turpius quam sapientis vitam ex insipientium sermone pendere? Nec enim, omnes avaritias si aeque avaritias esse dixerimus, sequetur ut etiam aequas esse dicamus. Atque haec contra Aristippum, qui eam voluptatem non modo summam, sed solam etiam ducit, quam omnes unam appellamus voluptatem. Quippe: habes enim a rhetoribus; Quid turpius quam sapientis vitam ex insipientium sermone pendere? Quis est enim, qui hoc cadere in sapientem dicere audeat, ut, si fieri possit, virtutem in perpetuum abiciat, ut dolore omni liberetur? Tubulum fuisse, qua illum, cuius is condemnatus est rogatione, P. Quid loquor de nobis, qui ad laudem et ad decus nati, suscepti, instituti sumus? Et ais, si una littera commota sit, fore tota ut labet disciplina. Ex ea difficultate illae fallaciloquae, ut ait Accius, malitiae natae sunt. Quamquam haec quidem praeposita recte et reiecta dicere licebit Licet hic rursus ea commemores, quae optimis verbis ab Epicuro de laude amicitiae dicta sunt. Si ad corpus pertinentibus, rationes tuas te video compensare cum istis doloribus, non memoriam corpore perceptarum voluptatum; Non enim, si omnia non sequebatur, idcirco non erat ortus illinc. Quod maxime efficit Theophrasti de beata vita liber, in quo multum admodum fortunae datur. Iubet igitur nos Pythius Apollo noscere nosmet ipsos. Quoniam igitur, ut medicina valitudinis, navigationis gubernatio, sic vivendi ars est prudente, necesse est eam quoque ab aliqua re esse constitutam et profectam. Quae fere omnia appellantur uno ingenii nomine, easque virtutes qui habent, ingeniosi vocantur. Aliter enim explicari, quod quaeritur, non potest. Ergo et avarus erit, sed finite, et adulter, verum habebit modum, et luxuriosus eodem modo. Me ipsum esse dicerem, inquam, nisi mihi viderer habere bene cognitam voluptatem et satis firme conceptam animo atque comprehensam. Quod quidem nobis non saepe contingit. Invidiosum nomen est, infame, suspectum. Quis suae urbis conservatorem Codrum, quis Erechthei filias non maxime laudat? Quo modo autem optimum, si bonum praeterea nullum est?";

            blackberry.ui.dialog.standardAskAsync(largePostText, blackberry.ui.dialog.D_OK_CANCEL, null, settings);
        });

        // Doesnt do anything with args but will throw error if limit is hit
        it("should not hit limit set by GET method. i.e. no more parse error", function () {
            var xhr = new XMLHttpRequest(),
                args = {
                    payload: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quo minus animus a se ipse dissidens secumque discordans gustare partem ullam liquidae voluptatis et liberae potest. Itaque si aut requietem natura non quaereret aut eam posset alia quadam ratione consequi. Cum praesertim illa perdiscere ludus esset. Quae hic rei publicae vulnera inponebat, eadem ille sanabat. Duo Reges: constructio interrete. Bestiarum vero nullum iudicium puto. Atque ut a corpore ordiar, videsne ut, si quae in membris prava aut debilitata aut inminuta sint, occultent homines? Num igitur utiliorem tibi hunc Triarium putas esse posse, quam si tua sint Puteolis granaria? An tu me de L. Non dolere, inquam, istud quam vim habeat postea videro; Hanc ergo intuens debet institutum illud quasi signum absolvere. Venit ad extremum; Qui autem de summo bono dissentit de tota philosophiae ratione dissentit. Plane idem, inquit, et maxima quidem, qua fieri nulla maior potest. Quae possunt eadem contra Carneadeum illud summum bonum dici, quod is non tam, ut probaret, protulit, quam ut Stoicis, quibuscum bellum gerebat, opponeret. Quocirca intellegi necesse est in ipsis rebus, quae discuntur et cognoscuntur, invitamenta inesse, quibus ad discendum cognoscendumque moveamur. Tum ille timide vel potius verecunde: Facio, inquit. Hic Speusippus, hic Xenocrates, hic eius auditor Polemo, cuius illa ipsa sessio fuit, quam videmus. Te enim iudicem aequum puto, modo quae dicat ille bene noris. Qualis ista philosophia est, quae non interitum afferat pravitatis, sed sit contenta mediocritate vitiorum? Idcirco enim non desideraret, quia, quod dolore caret, id in voluptate est. Memini vero, inquam; Ita enim vivunt quidam, ut eorum vita refellatur oratio. Esse enim, nisi eris, non potes. Ergo instituto veterum, quo etiam Stoici utuntur, hinc capiamus exordium. Sic enim maiores nostri labores non fugiendos tristissimo tamen verbo aerumnas etiam in deo nominaverunt. Minime vero, inquit ille, consentit. Quo minus animus a se ipse dissidens secumque discordans gustare partem ullam liquidae voluptatis et liberae potest. Satisne ergo pudori consulat, si quis sine teste libidini pareat? Sin ea non neglegemus neque tamen ad finem summi boni referemus, non multum ab Erilli levitate aberrabimus. Sed existimo te, sicut nostrum Triarium, minus ab eo delectari, quod ista Platonis, Aristoteli, Theophrasti orationis ornamenta neglexerit. Sed tamen intellego quid velit. Primum in nostrane potestate est, quid meminerimus? Cuius similitudine perspecta in formarum specie ac dignitate transitum est ad honestatem dictorum atque factorum. Consequatur summas voluptates non modo parvo, sed per me nihilo, si potest; In qua si nihil est praeter rationem, sit in una virtute finis bonorum; Illa argumenta propria videamus, cur omnia sint paria peccata. Qua tu etiam inprudens utebare non numquam. Atque ut a corpore ordiar, videsne ut, si quae in membris prava aut debilitata aut inminuta sint, occultent homines? Quis est, qui non oderit libidinosam, protervam adolescentiam? Portenta haec esse dicit, neque ea ratione ullo modo posse vivi; Quae in controversiam veniunt, de iis, si placet, disseramus. Satisne igitur videor vim verborum tenere, an sum etiam nunc vel Graece loqui vel Latine docendus? Atque hoc loco similitudines eas, quibus illi uti solent, dissimillimas proferebas. Quid enim tanto opus est instrumento in optimis artibus comparandis? Memini vero, inquam; Perturbationes autem nulla naturae vi commoventur, omniaque ea sunt opiniones ac iudicia levitatis. Sin tantum modo ad indicia veteris memoriae cognoscenda, curiosorum. Num igitur eum postea censes anxio animo aut sollicito fuisse? Teneo, inquit, finem illi videri nihil dolere. Est autem a te semper dictum nec gaudere quemquam nisi propter corpus nec dolere. Luxuriam non reprehendit, modo sit vacua infinita cupiditate et timore. Expectoque quid ad id, quod quaerebam, respondeas. Deinde qui fit, ut ego nesciam, sciant omnes, quicumque Epicurei esse voluerunt? An ea, quae per vinitorem antea consequebatur, per se ipsa curabit? Ab his oratores, ab his imperatores ac rerum publicarum principes extiterunt. Atque haec coniunctio confusioque virtutum tamen a philosophis ratione quadam distinguitur. Ergo, si semel tristior effectus est, hilara vita amissa est? Nec vero pietas adversus deos nec quanta iis gratia debeatur sine explicatione naturae intellegi potest. Huius ego nunc auctoritatem sequens idem faciam. Quid turpius quam sapientis vitam ex insipientium sermone pendere? Nec enim, omnes avaritias si aeque avaritias esse dixerimus, sequetur ut etiam aequas esse dicamus. Atque haec contra Aristippum, qui eam voluptatem non modo summam, sed solam etiam ducit, quam omnes unam appellamus voluptatem. Quippe: habes enim a rhetoribus; Quid turpius quam sapientis vitam ex insipientium sermone pendere? Quis est enim, qui hoc cadere in sapientem dicere audeat, ut, si fieri possit, virtutem in perpetuum abiciat, ut dolore omni liberetur? Tubulum fuisse, qua illum, cuius is condemnatus est rogatione, P. Quid loquor de nobis, qui ad laudem et ad decus nati, suscepti, instituti sumus? Et ais, si una littera commota sit, fore tota ut labet disciplina. Ex ea difficultate illae fallaciloquae, ut ait Accius, malitiae natae sunt. Quamquam haec quidem praeposita recte et reiecta dicere licebit Licet hic rursus ea commemores, quae optimis verbis ab Epicuro de laude amicitiae dicta sunt. Si ad corpus pertinentibus, rationes tuas te video compensare cum istis doloribus, non memoriam corpore perceptarum voluptatum; Non enim, si omnia non sequebatur, idcirco non erat ortus illinc. Quod maxime efficit Theophrasti de beata vita liber, in quo multum admodum fortunae datur. Iubet igitur nos Pythius Apollo noscere nosmet ipsos. Quoniam igitur, ut medicina valitudinis, navigationis gubernatio, sic vivendi ars est prudente, necesse est eam quoque ab aliqua re esse constitutam et profectam. Quae fere omnia appellantur uno ingenii nomine, easque virtutes qui habent, ingeniosi vocantur. Aliter enim explicari, quod quaeritur, non potest. Ergo et avarus erit, sed finite, et adulter, verum habebit modum, et luxuriosus eodem modo. Me ipsum esse dicerem, inquam, nisi mihi viderer habere bene cognitam voluptatem et satis firme conceptam animo atque comprehensam. Quod quidem nobis non saepe contingit. Invidiosum nomen est, infame, suspectum. Quis suae urbis conservatorem Codrum, quis Erechthei filias non maxime laudat? Quo modo autem optimum, si bonum praeterea nullum est?"
                };

            xhr.open("GET", "http://localhost:8472/blackberry.app/getReadOnlyFields", false);
            xhr.send(JSON.stringify(args));
            expect(xhr.status).toBe(200);
        });
    });
});
