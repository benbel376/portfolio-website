here is how the system works

Structural design
	> the website general file structure is as follows.
	the global structure has the following files.
		> index.php
		> api.php
		> entry.json
		> builders
			builder_t1.php
		> endpoints
			> dynamic_content.php
			> security.php
			> media_management.php
			> definitions_management.php
		> definitions
			> profiles
				mlops_t1.json
			> site
				top_bar_t1.json
			> pages
				profile_t1.json
				projects_t1.json
				project_details_t1.json
		> blocks
			> sites
				> top_bar
					structure_t1.html
					style_t1.html
					behavior_t1.js
					assembly_t1.php
					assets
						backgrounds.jpg
			> containers
				> vertical
					structure_t1.html
					style_t1.html
					behavior_t1.js
					assembly_t1.php
					assets
			
			> components
				> hero
					structure_t1.html
					style_t1.html
					behavior_t1.js
					assembly_t1.php
					assets
						backgrounds.jpg
			
	> global functionalities (site level)
		> navigation
		> security
		> dynamic loading
		> theme control
		> global assembler
		
	> local functionalities.(component level)
		> structure 
		> style (adaptability and theme integration)
		> behavior (state management hook, loading trigger hook)
		> asset
		> local assembler
		
		
		
	execution flows:
		> 