.PHONY:	clean prune prototype build start

KIT_VERSION=6.3.0
KIT_NAME=govuk_prototype_kit
KIT_ZIP=cache/$(KIT_NAME).zip
KIT_URL='https://github.com/alphagov/$(KIT_NAME)/archive/v$(KIT_VERSION).zip'
KIT_UNZIPPED=prototype/node_modules

APP_DIR=prototype/app
VIEWS_DIR=$(APP_DIR)/views

EXAMPLES=\
	$(VIEWS_DIR)/simplest\
	$(VIEWS_DIR)/simple\
	$(VIEWS_DIR)/apply-for-a-medal

SRC_TEMPLATES=\
	templates/*.ntk\
	templates/*.html

SRC_PROTOTYPE_MACROS=\
	templates/frontend_macros.ntk

PROTOTYPE_MACROS=\
	$(subst templates/,$(VIEWS_DIR)/,$(SRC_PROTOTYPE_MACROS))

SRC_PROTOTYPE_ROUTER=lib/routes.js
PROTOTYPE_ROUTER=prototype/app/routes.js

SRC_PROTOTYPE_LAYOUT=lib/layout.html
PROTOTYPE_LAYOUT=prototype/app/views/layout.html

SRC_PROTOTYPE_SCSS=lib/submit.scss
PROTOTYPE_SCSS=prototype/app/assets/sass/submit.scss

SRC_PROTOTYPE_APPLICATION_SCSS=lib/application.scss
PROTOTYPE_APPLICATION_SCSS=prototype/app/assets/sass/application.scss

SRC_PROTOTYPE_INDEX=lib/index.html
PROTOTYPE_INDEX=prototype/app/views/index.html

SRC_PROTOTYPE_DAGRE=lib/dagre-d3.js
PROTOTYPE_DAGRE=prototype/app/assets/javascripts/dagre-d3.js

PROTOTYPE=\
	$(PROTOTYPE_MACROS)\
	$(PROTOTYPE_ROUTER)\
	$(PROTOTYPE_SCSS)\
	$(PROTOTYPE_DAGRE)\
	$(PROTOTYPE_APPLICATION_SCSS)\
	$(PROTOTYPE_LAYOUT)\
	$(PROTOTYPE_INDEX)

all:	$(EXAMPLES)

$(VIEWS_DIR)/%:	prototype bin/submit.js $(SRC_TEMPLATES) examples/%.json
	bin/submit.js -o $(APP_DIR) $(patsubst $(VIEWS_DIR)/%,examples/%.json,$(@))

start:
	cd prototype; npm start

prototype:	$(PROTOTYPE)

# copy in the macros used by the generated templates
$(PROTOTYPE_MACROS):	$(SRC_PROTOTYPE_MACROS) $(KIT_UNZIPPED)
	cp $(SRC_PROTOTYPE_MACROS) $(VIEWS_DIR)

# copy in the router
$(PROTOTYPE_ROUTER):	$(SRC_PROTOTYPE_ROUTER) $(KIT_UNZIPPED)
	cp $(SRC_PROTOTYPE_ROUTER) $(PROTOTYPE_ROUTER)

# copy in the index page
$(PROTOTYPE_INDEX):	$(SRC_PROTOTYPE_INDEX) $(KIT_UNZIPPED)
	cp $(SRC_PROTOTYPE_INDEX) $(PROTOTYPE_INDEX)

# copy in compiled CSS
$(PROTOTYPE_SCSS):	$(SRC_PROTOTYPE_SCSS) $(KIT_UNZIPPED)
	cp $(SRC_PROTOTYPE_SCSS) $(PROTOTYPE_SCSS)

# copy in layout
$(PROTOTYPE_LAYOUT):	$(SRC_PROTOTYPE_LAYOUT) $(KIT_UNZIPPED)
	cp $(SRC_PROTOTYPE_LAYOUT) $(PROTOTYPE_LAYOUT)

$(PROTOTYPE_APPLICATION_SCSS):	$(SRC_PROTOTYPE_APPLICATION_SCSS) $(KIT_UNZIPPED)
	cp $(SRC_PROTOTYPE_APPLICATION_SCSS) $(PROTOTYPE_APPLICATION_SCSS)

# copy in dagre
$(PROTOTYPE_DAGRE):	$(SRC_PROTOTYPE_DAGRE) $(KIT_UNZIPPED)
	cp $(SRC_PROTOTYPE_DAGRE) $(PROTOTYPE_DAGRE)

$(KIT_UNZIPPED):	$(KIT_ZIP)
	unzip -o '$(KIT_ZIP)'
	mv '$(KIT_NAME)-$(KIT_VERSION)' prototype
	cd prototype && npm install && npm install session-file-store

$(KIT_ZIP):
	@mkdir -p cache
	curl -sL '$(KIT_URL)' > '$@'

init:
	npm install

# Beware! This removes the generated prototype
clean::;	rm -rf prototype
